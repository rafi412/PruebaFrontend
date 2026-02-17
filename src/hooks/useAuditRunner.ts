import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { Check, Audit, AuditStatus } from '../types';
import { calculateProgress, determineStatus } from '../utils/auditLogic';

/**
 * Orquestador de la simulación de ejecución de auditoría.
 * Gestiona la transición secuencial de estados de los checks y 
 * asegura la persistencia de resultados en la capa de servicio.
 */
export function useAuditRunner(initialAudit: Audit) {
    const [audit, setAudit] = useState<Audit>(initialAudit);
    const [isRunning, setIsRunning] = useState(false);

    /**
     * Ejecuta el flujo asíncrono de simulación para los puntos de control.
     * Implementa lógica de re-intento para elementos pendientes o con fallos previos.
     */
    const runSimulation = useCallback(async () => {
        if (isRunning) return;

        setIsRunning(true);

        try {
            // Sincronización inicial del estado de la auditoría en la capa de servicios
            await api.runAudit(audit.id);
            setAudit(prev => ({ ...prev, status: 'IN_PROGRESS' }));

            const currentChecks = [...audit.checks];

            for (let i = 0; i < currentChecks.length; i++) {
                const check = currentChecks[i];

                // Los elementos con estado 'OK' se consideran finalizados y se omiten
                if (check.status === 'OK') continue;

                // Transición a estado de espera en cola
                currentChecks[i] = { ...check, status: 'QUEUED' };
                updateLocalProgress(currentChecks);
                await new Promise(r => setTimeout(r, 400));

                // Transición a estado de procesamiento activo
                currentChecks[i] = { ...currentChecks[i], status: 'RUNNING' };
                updateLocalProgress(currentChecks);
                await new Promise(r => setTimeout(r, 800));

                // Determinación del resultado final basada en umbrales de probabilidad configurados
                const isKO = Math.random() < 0.15;
                const finalStatus = isKO ? 'KO' : 'OK';

                currentChecks[i] = {
                    ...currentChecks[i],
                    status: finalStatus,
                    reviewed: true,
                    updatedAt: new Date().toISOString()
                };

                updateLocalProgress(currentChecks);

                // Persistencia individual de cada punto de control para garantizar integridad de datos
                await api.updateCheck(audit.id, check.id, { status: finalStatus, reviewed: true });
            }

            // Evaluación del estado global resultante tras la ejecución
            const hasKO = currentChecks.some(c => c.status === 'KO');

            /**
             * Si existen incidencias (KO), la auditoría permanece en 'IN_PROGRESS' 
             * para requerir intervención manual, a pesar de haber completado el flujo.
             */
            const finalAuditStatus: AuditStatus = hasKO ? 'IN_PROGRESS' : 'DONE';

            setAudit(prev => ({
                ...prev,
                status: finalAuditStatus,
                progress: 100,
                updatedAt: new Date().toISOString()
            }));

        } catch (error) {
            console.error("Error durante la simulación de auditoría:", error);
        } finally {
            // Asegura la liberación del estado de ejecución para permitir nuevas interacciones
            setIsRunning(false);
        }
    }, [audit, isRunning]);

    /**
     * Actualiza las métricas de progreso local basándose en el volumen de checks procesados.
     */
    const updateLocalProgress = (checks: Check[]) => {
        const total = checks.length;
        const processed = checks.filter(c => c.status === 'OK' || c.status === 'KO').length;
        const progress = Math.round((processed / total) * 100);

        setAudit(prev => ({ ...prev, checks, progress }));
    };

    /**
     * Realiza una actualización de estado optimista sobre un punto de control individual.
     * Implementa un mecanismo de reversión (rollback) en caso de fallo en la persistencia.
     */
    const updateCheckOptimistically = async (checkId: string, newStatus: 'OK' | 'KO') => {
        const previousChecks = [...audit.checks];

        const updatedChecks = audit.checks.map(c => 
            c.id === checkId ? { ...c, status: newStatus, reviewed: true, updatedAt: new Date().toISOString() } : c
        );
        
        // Actualización inmediata de la interfaz de usuario
        setAudit(prev => ({ 
            ...prev, 
            checks: updatedChecks, 
            progress: calculateProgress(updatedChecks),
            status: determineStatus(updatedChecks)
        }));

        try {
            await api.updateCheck(audit.id, checkId, { status: newStatus, reviewed: true });
        } catch (error) {
            // Restauración del estado previo ante errores de red o servidor
            setAudit(prev => ({ 
                ...prev, 
                checks: previousChecks,
                progress: calculateProgress(previousChecks),
                status: determineStatus(previousChecks)
            }));
        }
    };

    return { audit, isRunning, runSimulation, updateCheckOptimistically };
}