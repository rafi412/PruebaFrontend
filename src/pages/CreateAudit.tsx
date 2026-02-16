import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ClipboardList, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { dbTemplates, dbUsers } from '../mocks/db';
import { cn } from '../utils/cn';

export default function CreateAudit() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado centralizado del formulario
    const [formData, setFormData] = useState({
        name: '',
        process: 'Seguridad',
        ownerId: 'u1', // Guardamos solo el ID para el select
        templateId: ''
    });

    // Lógica de validación para el Paso 1
    const canProceed = formData.name.trim().length >= 5 && formData.process !== '' && formData.ownerId !== '';

    const handleFinish = async () => {
        if (!formData.templateId) return;
        setIsSubmitting(true);

        // Buscamos el objeto completo del owner para enviarlo a la API
        const selectedOwner = dbUsers.find(u => u.id === formData.ownerId);

        try {
            const created = await api.createAudit({
                ...formData,
                owner: selectedOwner || dbUsers[0]
            });
            navigate(`/audit/${created.id}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-4">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
            >
                <ArrowLeft size={20} /> Cancelar y volver
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Header del Wizard con Indicador de Pasos */}
                <div className="flex bg-gray-50/50 border-b border-gray-100">
                    <div className={cn(
                        "flex-1 p-4 text-center border-b-2 transition-colors",
                        step === 1 ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400"
                    )}>
                        <span className="text-xs font-bold uppercase tracking-widest">Paso 1</span>
                        <p className="font-bold">Información General</p>
                    </div>
                    <div className={cn(
                        "flex-1 p-4 text-center border-b-2 transition-colors",
                        step === 2 ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400"
                    )}>
                        <span className="text-xs font-bold uppercase tracking-widest">Paso 2</span>
                        <p className="font-bold">Modelo de Evaluación</p>
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre descriptivo</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Ej: Auditoría de Seguridad Q1 - 2025"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <p className="text-xs text-gray-400 mt-2 italic">Mínimo 5 caracteres para continuar.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Proceso de negocio</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.process}
                                    onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                                >
                                    <option value="Seguridad">Seguridad e IT</option>
                                    <option value="Compras">Compras y Suministros</option>
                                    <option value="Ventas">Ventas y Comercial</option>
                                    <option value="RRHH">Recursos Humanos</option>
                                    <option value="Operaciones">Operaciones Logísticas</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Responsable de la Auditoría</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.ownerId}
                                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                                >
                                    {dbUsers.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 gap-3">
                                {dbTemplates.map((tpl) => (
                                    <label
                                        key={tpl.id}
                                        className={cn(
                                            "flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all",
                                            formData.templateId === tpl.id ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                formData.templateId === tpl.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
                                            )}>
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{tpl.name}</p>
                                                <p className="text-xs text-gray-500">{tpl.checkCount} puntos de control • {tpl.process}</p>
                                            </div>
                                        </div>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            checked={formData.templateId === tpl.id}
                                            onChange={() => setFormData({ ...formData, templateId: tpl.id })}
                                        />
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                            formData.templateId === tpl.id ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                        )}>
                                            {formData.templateId === tpl.id && <Check size={14} className="text-white" />}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer con controles de navegación */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <div>
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-2 text-gray-600 font-bold hover:text-gray-900 transition-colors"
                            >
                                Anterior
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {step === 1 ? (
                            <button
                                disabled={!canProceed}
                                onClick={() => setStep(2)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-md shadow-blue-100"
                            >
                                Siguiente <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                disabled={!formData.templateId || isSubmitting}
                                onClick={handleFinish}
                                className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-green-100"
                            >
                                {isSubmitting ? 'Procesando...' : 'Crear Auditoría'} <Check size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}