import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { Check, Audit, AuditStatus } from '../types';

/**
 * Orquestador de la simulación de ejecución de auditoría.
 * Gestiona la transición secuencial de estados de los checks y 
 * asegura la persistencia de resultados en la capa de servicio.
 */
export function useAuditRunner(initialAudit: Audit) {
    const [audit, setAudit] = useState<Audit>(initialAudit);
    const [isRunning, setIsRunning] = useState(false);

    const runSimulation = useCallback(async () => {
        if (isRunning) return;

        setIsRunning(true); // Bloqueamos la UI para evitar ejecuciones duplicadas

        try {
            // 1. Iniciamos la auditoría en el "servidor"
            await api.runAudit(audit.id);
            setAudit(prev => ({ ...prev, status: 'IN_PROGRESS' }));

            const currentChecks = [...audit.checks];

            for (let i = 0; i < currentChecks.length; i++) {
                const check = currentChecks[i];

                // Solo ignoramos los que ya están perfectos (OK).
                // Los PENDING y los KO se volverán a procesar.
                if (check.status === 'OK') continue;

                // Fase: QUEUED
                currentChecks[i] = { ...check, status: 'QUEUED' };
                updateLocalProgress(currentChecks);
                await new Promise(r => setTimeout(r, 400));

                // Fase: RUNNING (Procesando)
                currentChecks[i] = { ...currentChecks[i], status: 'RUNNING' };
                updateLocalProgress(currentChecks);
                await new Promise(r => setTimeout(r, 800));

                // Fase: Resultado (15% probabilidad de KO según PDF)
                const isKO = Math.random() < 0.15;
                const finalStatus = isKO ? 'KO' : 'OK';

                currentChecks[i] = {
                    ...currentChecks[i],
                    status: finalStatus,
                    reviewed: true,
                    updatedAt: new Date().toISOString()
                };

                updateLocalProgress(currentChecks);

                // Persistimos el cambio de cada check individualmente
                await api.updateCheck(audit.id, check.id, { status: finalStatus, reviewed: true });
            }

            // 2. Lógica de finalización (Punto 6 del PDF)
            const hasKO = currentChecks.some(c => c.status === 'KO');

            /**
             * JUSTIFICACIÓN DE ESTADO:
             * Si hay un KO, mantenemos IN_PROGRESS pero con progreso 100%. 
             * Esto indica que la ejecución terminó pero requiere revisión manual (no es DONE).
             */
            const finalAuditStatus: AuditStatus = hasKO ? 'IN_PROGRESS' : 'DONE';

            setAudit(prev => ({
                ...prev,
                status: finalAuditStatus,
                progress: 100,
                updatedAt: new Date().toISOString()
            }));

        } catch (error) {
            console.error("Error durante la simulación:", error);
        } finally {
            // El bloque finally asegura que el botón se desbloquee siempre, 
            // falle la API o haya un KO.
            setIsRunning(false);
        }
    }, [audit, isRunning]);

    const updateLocalProgress = (checks: Check[]) => {
        const total = checks.length;
        const processed = checks.filter(c => c.status === 'OK' || c.status === 'KO').length;
        const progress = Math.round((processed / total) * 100);

        setAudit(prev => ({ ...prev, checks, progress }));
    };

    return { audit, isRunning, runSimulation };
}