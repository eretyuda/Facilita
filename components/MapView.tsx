
import React, { useState, useEffect, useRef } from 'react';
import { ATM, ATMStatus, Bank } from '../types';
import { MapPin, Navigation, ThumbsUp, X, Compass, CornerUpRight, CornerUpLeft, ArrowUp } from 'lucide-react';
import { Button } from './Button';
import { Toast, ToastType } from './Toast';

interface MapViewProps {
    atms?: ATM[];
    banks?: Bank[];
    onValidateATM?: (id: string) => void;
    votedAtms?: string[]; // IDs of ATMs user has already validated
}

export const MapView: React.FC<MapViewProps> = ({ atms = [], banks = [], onValidateATM, votedAtms = [] }) => {
    const [selectedATM, setSelectedATM] = useState<ATM | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'HAS_MONEY' | 'ONLINE' | 'OFFLINE'>('ALL');

    // Navigation State
    const [isNavigating, setIsNavigating] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; heading: number | null }>({ lat: 0, lng: 0, heading: 0 });
    const [navigationTarget, setNavigationTarget] = useState<{ lat: number; lng: number } | null>(null);
    const [remainingDist, setRemainingDist] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [instructionStep, setInstructionStep] = useState(0);

    // Watch ID for geolocation
    const watchIdRef = useRef<number | null>(null);

    // Toast State
    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
        show: false,
        message: '',
        type: 'success'
    });

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    // Calculate bearing (angle) between two points
    const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
        const startLatRad = startLat * Math.PI / 180;
        const startLngRad = startLng * Math.PI / 180;
        const destLatRad = destLat * Math.PI / 180;
        const destLngRad = destLng * Math.PI / 180;

        const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
        const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

        const brng = Math.atan2(y, x);
        return (brng * 180 / Math.PI + 360) % 360; // in degrees
    };

    // Reset navigation when ATM is deselected
    useEffect(() => {
        if (!selectedATM) {
            stopNavigation();
        }
    }, [selectedATM]);

    const stopNavigation = () => {
        setIsNavigating(false);
        setNavigationTarget(null);
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    };

    const filteredATMs = atms.filter(atm => {
        if (filter === 'HAS_MONEY') return atm.status === ATMStatus.HAS_MONEY;
        if (filter === 'ONLINE') return atm.status !== ATMStatus.OFFLINE;
        if (filter === 'OFFLINE') return atm.status === ATMStatus.OFFLINE;
        return true;
    });

    // Debug logging
    useEffect(() => {
        console.log('[MapView] ATMs received:', atms);
        console.log('[MapView] Filtered ATMs:', filteredATMs);
        console.log('[MapView] Filter:', filter);
    }, [atms, filteredATMs, filter]);

    const getRingColor = (status: ATMStatus) => {
        switch (status) {
            case ATMStatus.HAS_MONEY: return 'ring-4 ring-green-500'; // Green ring for money
            case ATMStatus.ONLINE: return 'ring-4 ring-yellow-500'; // Yellow ring for online
            case ATMStatus.NO_MONEY: return 'ring-4 ring-orange-500'; // Orange ring for no money
            case ATMStatus.OFFLINE: return 'ring-4 ring-red-600'; // Red ring for offline
            default: return 'ring-4 ring-gray-500';
        }
    };

    const handleNavigate = async () => {
        if (!selectedATM) return;

        if (!navigator.geolocation) {
            setToast({ show: true, message: "Geolocalização não suportada neste navegador.", type: 'error' });
            return;
        }

        // Check if Permissions API is available (modern browsers)
        if ('permissions' in navigator) {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });

                if (permissionStatus.state === 'denied') {
                    setToast({
                        show: true,
                        message: "Localização bloqueada. Por favor, ative a localização nas configurações do seu navegador/telefone.",
                        type: 'warning'
                    });

                    // Open Google Maps as fallback
                    setTimeout(() => {
                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedATM.lat},${selectedATM.lng}`;
                        window.location.href = mapsUrl;
                    }, 2000);
                    return;
                }

                if (permissionStatus.state === 'prompt') {
                    setToast({
                        show: true,
                        message: "Por favor, permita o acesso à sua localização quando solicitado.",
                        type: 'info'
                    });
                }
            } catch (error) {
                console.log('Permissions API not fully supported, proceeding with geolocation request');
            }
        }

        // Request geolocation with better error handling
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, heading } = pos.coords;

                setUserLocation({ lat: latitude, lng: longitude, heading: heading || 0 });

                // Since our Mock ATMs have fake coords (0-100), we need to simulate a real target
                // relative to the user's real position so the math works.
                // Let's pretend the ATM is 1.5km away in a somewhat random direction for the demo
                const targetLat = latitude + 0.005; // ~500m north
                const targetLng = longitude + 0.005; // ~500m east

                setNavigationTarget({ lat: targetLat, lng: targetLng });
                setIsNavigating(true);

                setToast({
                    show: true,
                    message: "Navegação iniciada! Siga as instruções.",
                    type: 'success'
                });

                // Start Watching Position
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude: lat, longitude: lng, heading: head, speed } = position.coords;

                        setUserLocation({ lat, lng, heading: head || 0 });

                        // Calculate Distance
                        const distKm = calculateDistance(lat, lng, targetLat, targetLng);
                        setRemainingDist(distKm);

                        // Calculate Time (Assuming average speed of 30km/h or walking 5km/h)
                        // If speed is available from GPS (m/s), use it. Else assume driving.
                        const speedKmh = (speed || 8.33) * 3.6; // 8.33 m/s ~= 30km/h default
                        const timeMins = Math.ceil((distKm / Math.max(speedKmh, 5)) * 60);
                        setRemainingTime(timeMins);

                        // Update Instruction roughly based on distance
                        if (distKm < 0.1) setInstructionStep(2); // Arriving
                        else if (distKm < 0.5) setInstructionStep(1);
                        else setInstructionStep(0);
                    },
                    (err) => console.error('Error watching position:', err),
                    { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
                );
            },
            (err) => {
                // Improved error handling with specific messages
                let errorMessage = "Erro ao obter localização.";
                let errorTitle = "Erro de Localização";
                let isPermissionError = false;

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorTitle = "Permissão Negada";
                        errorMessage = "Você negou o acesso à localização. Para usar a navegação:\n\n" +
                            "📱 No telefone: Vá em Configurações > Privacidade > Localização e ative para este navegador.\n\n" +
                            "💻 No computador: Clique no ícone de cadeado/informação na barra de endereço e permita a localização.\n\n" +
                            "Abrindo Google Maps como alternativa...";
                        isPermissionError = true;
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = "Localização indisponível. Verifique se:\n" +
                            "• O GPS está ativado\n" +
                            "• Você está em área com sinal\n" +
                            "• O serviço de localização está funcionando";
                        break;
                    case err.TIMEOUT:
                        errorMessage = "Tempo esgotado ao obter localização. Tente novamente ou verifique sua conexão.";
                        break;
                }

                console.error(`${errorTitle}:`, errorMessage, err);

                setToast({
                    show: true,
                    message: isPermissionError ? errorMessage : `${errorTitle}: ${errorMessage}`,
                    type: isPermissionError ? 'warning' : 'error'
                });

                // Fallback: Open in Google Maps
                if (selectedATM) {
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedATM.lat},${selectedATM.lng}`;
                    // Longer delay for permission errors to let user read the message
                    setTimeout(() => { window.location.href = mapsUrl; }, isPermissionError ? 3000 : 1500);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000, // Increased timeout for mobile
                maximumAge: 0 // Don't use cached position
            }
        );
    };

    const handleValidate = () => {
        if (!selectedATM) return;

        const hasVoted = votedAtms.includes(selectedATM.id);

        // Trigger parent update logic (toggle)
        if (onValidateATM) {
            onValidateATM(selectedATM.id);
        }

        // Optimistically update local view logic for the button state
        // (The actual counts come from props.atms which is updated by parent)

        setToast({
            show: true,
            message: hasVoted ? 'Voto removido.' : 'Obrigado pela confirmação!',
            type: 'success'
        });
    };

    const renderNavigationInstruction = () => {
        const instructions = [
            { icon: ArrowUp, text: "Siga em frente na sua direção atual" },
            { icon: CornerUpRight, text: "Prepare-se para virar à direita" },
            { icon: MapPin, text: "O destino está à sua frente" }
        ];
        const current = instructions[instructionStep];
        const Icon = current.icon;

        return (
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon size={32} className="text-white" />
                </div>
                <div>
                    <p className="text-white/80 text-xs font-bold uppercase">Navegação GPS</p>
                    <p className="text-white font-bold text-lg leading-tight">{current.text}</p>
                </div>
            </div>
        );
    };

    // Calculate rotation for the arrow based on bearing to target
    const arrowRotation = isNavigating && navigationTarget
        ? calculateBearing(userLocation.lat, userLocation.lng, navigationTarget.lat, navigationTarget.lng)
        : (userLocation.heading || 0);

    return (
        <div className="relative h-full w-full bg-gray-100 overflow-hidden">
            {/* Fallback for no ATMs */}
            {atms.length === 0 && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm pointer-events-none">
                    <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm mx-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="text-indigo-600" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum ATM Encontrado</h3>
                        <p className="text-gray-500 text-sm">Não foi possível carregar os ATMs ou não há nenhum cadastrado no momento.</p>
                    </div>
                </div>
            )}

            {/* --- Top Navigation Overlay (Active Mode) --- */}
            {isNavigating && selectedATM && (
                <div className="absolute top-0 left-0 right-0 bg-indigo-600 z-50 p-4 pb-12 rounded-b-3xl shadow-xl animate-[slideDown_0.3s_ease-out]">
                    <div className="flex justify-between items-start mb-4">
                        {renderNavigationInstruction()}
                        <button
                            onClick={stopNavigation}
                            className="bg-red-500/20 hover:bg-red-500/40 text-white px-3 py-1 rounded-full text-xs font-bold transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                    <div className="flex justify-between items-end border-t border-white/10 pt-3">
                        <div>
                            <p className="text-white/60 text-xs">Destino</p>
                            <p className="text-white font-bold">{selectedATM.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-white">{remainingTime}<span className="text-sm font-medium opacity-60">min</span></p>
                            <p className="text-teal-300 text-sm font-bold">{remainingDist.toFixed(2)} km</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Simulation Container */}
            <div className="absolute inset-0 bg-gray-50 w-full h-full overflow-hidden">
                {/* Mock Map Grid Lines */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}>
                </div>

                {/* Mock Map Streets (SVG Overlay) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Background Streets */}
                    <path d="M0,10 Q20,15 40,10 T80,30" stroke="gray" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" opacity="0.2" />
                    <path d="M30,0 L35,80" stroke="gray" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" opacity="0.2" />
                    <path d="M10,50 L70,50" stroke="gray" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" opacity="0.2" />

                    {/* Dynamic Route Line */}
                    {isNavigating && selectedATM && (
                        <line
                            x1="50"
                            y1="50"
                            x2={selectedATM.lng}
                            y2={selectedATM.lat}
                            stroke="#4F46E5"
                            strokeWidth="4"
                            strokeDasharray="5"
                            opacity="0.5"
                            className="animate-pulse"
                        />
                    )}
                </svg>

                {/* User Location Pulse */}
                <div
                    className={`absolute z-10 transition-all duration-500 ease-linear`}
                    style={{
                        top: isNavigating ? '50%' : '50%', // Keep centered during nav
                        left: isNavigating ? '50%' : '50%',
                        transform: `translate(-50%, -50%) rotate(${arrowRotation}deg)`
                    }}
                >
                    {isNavigating ? (
                        // Navigation Arrow
                        <div className="w-16 h-16 flex items-center justify-center relative">
                            <Navigation size={40} className="text-indigo-600 fill-indigo-600 drop-shadow-xl" />
                            {/* Radar ping effect */}
                            <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20"></div>
                        </div>
                    ) : (
                        // Standard User Dot
                        <>
                            <div className="w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-xl relative">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm whitespace-nowrap text-indigo-800 pointer-events-none">Você</div>
                        </>
                    )}
                </div>

                {/* ATM Pins */}
                {filteredATMs.map((atm) => (
                    <button
                        key={atm.id}
                        onClick={() => setSelectedATM(atm)}
                        disabled={isNavigating && selectedATM?.id !== atm.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 z-20 
                ${isNavigating && selectedATM?.id !== atm.id ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}
            `}
                        style={{
                            left: `${atm.lng}%`,
                            top: `${atm.lat}%`
                        }}
                    >
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${getRingColor(atm.status)} shadow-lg flex items-center justify-center relative transition-all duration-300 p-0.5`}>
                            {isNavigating && selectedATM?.id === atm.id ? (
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                                </div>
                            ) : (
                                (() => {
                                    const bank = banks.find(b => b.name === atm.bank);
                                    if (bank && bank.logo) {
                                        return (
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-0.5">
                                                <img src={bank.logo} alt={atm.bank} className="w-full h-full object-cover rounded-full" />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                            <span className="text-gray-700 text-[10px] font-bold">ATM</span>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                        {(!isNavigating || selectedATM?.id === atm.id) && (
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold shadow text-gray-700 whitespace-nowrap">
                                {atm.bank}
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Top Filter Bar */}
            {!isNavigating && (
                <div className="absolute top-10 left-4 right-4 z-30 flex gap-2 overflow-x-auto no-scrollbar pb-2 animate-[fadeIn_0.3s_ease-out]">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}>
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('HAS_MONEY')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${filter === 'HAS_MONEY' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}>
                        Tem Dinheiro 💵
                    </button>
                    <button
                        onClick={() => setFilter('ONLINE')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${filter === 'ONLINE' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700'}`}>
                        Sistema Online 🟢
                    </button>
                    <button
                        onClick={() => setFilter('OFFLINE')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${filter === 'OFFLINE' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}>
                        Offline 🔴
                    </button>
                </div>
            )}

            {/* Selected ATM Bottom Sheet */}
            {selectedATM && !isNavigating && (
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-40 p-6 animate-[slideUp_0.3s_ease-out]">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedATM.name}</h2>
                            <p className="text-gray-500 text-sm">{selectedATM.address}</p>
                        </div>
                        <button onClick={() => setSelectedATM(null)} className="p-2 bg-gray-100 rounded-full">
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                    ${selectedATM.status === ATMStatus.HAS_MONEY ? 'bg-teal-100 text-teal-700' :
                                selectedATM.status === ATMStatus.OFFLINE ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {selectedATM.status === ATMStatus.HAS_MONEY && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
                            {selectedATM.status}
                        </div>
                        <div className="text-sm text-gray-500">
                            {selectedATM.distance} • Atualizado {selectedATM.lastUpdated}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="primary" onClick={handleNavigate}>
                            <Navigation size={18} />
                            Ir agora
                        </Button>

                        <Button
                            variant={votedAtms.includes(selectedATM.id) ? "primary" : "outline"}
                            className={votedAtms.includes(selectedATM.id) ? "bg-teal-600 hover:bg-teal-700 border-none text-white shadow-none" : ""}
                            onClick={handleValidate}
                        >
                            <ThumbsUp size={18} className={votedAtms.includes(selectedATM.id) ? "fill-white" : ""} />
                            {votedAtms.includes(selectedATM.id) ? `Validado (${selectedATM.votes || 0})` : `Validar (${selectedATM.votes || 0})`}
                        </Button>
                    </div>
                </div>
            )}

            {/* Validation Only Bottom Sheet */}
            {isNavigating && remainingDist < 0.1 && (
                <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl shadow-2xl z-50 p-4 animate-[bounceIn_0.5s_ease-out]">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MapPin className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">Chegou ao destino!</h3>
                        <p className="text-sm text-gray-500 mb-4">O ATM está funcionando?</p>
                        <Button fullWidth onClick={() => { handleValidate(); stopNavigation(); }}>
                            <ThumbsUp size={18} className="mr-2" />
                            Validar ATM
                        </Button>
                    </div>
                </div>
            )}

            <Toast
                isVisible={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};
