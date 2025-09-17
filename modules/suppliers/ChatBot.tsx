import { useEffect, useState } from 'react';
import { 
    TrendingUp, 
    PackageSearch, 
    BadgeDollarSign,
    CreditCard, 
    Truck, 
    Star, 
    ArrowLeft, 
    MessageSquare 
} from 'lucide-react'; 

import { useAuth } from '@/context/AuthContext';
import { ProductDAO } from '@/types/Api';
import CustomButton from '../../components/atoms/CustomButton';
import SearchBarUniversal from '../../components/molecules/SearchBar';
import { findBetterSuppliers, getSectorTrends } from '@/lib/api-suppliers';

type Filters = "Mejor precio" | "Mejores condiciones de pago" | "Mejor tiempo de entrega" | "Mejor reputación";
type Answers = {
    searchType: "Tendencias de proveedores en el sector" | "Buscar proveedores con mejores precios o planes" | null;
    product: ProductDAO | null;
    filters: Filters[];
    region?: string;
    companySize?: string;
};

export default function ChatBot() {
    const { user } = useAuth();
    const [supplierResults, setSupplierResults] = useState<any[]>([]);
    const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);

    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1); 
    const [answers, setAnswers] = useState<Answers>({
        searchType: null,
        product: null,
        filters: [],
    });

    // Estados para País, Estado y Ciudad
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);
    const [availableStates, setAvailableStates] = useState<string[]>([]);
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    const [country, setCountry] = useState<string>('');
    const [stateSelected, setStateSelected] = useState<string>('');
    const [citySelected, setCitySelected] = useState<string>('');

    const searchTypeOptions = [
        {
            label: "Tendencias de proveedores en el sector",
            value: "Tendencias de proveedores en el sector" as const,
            icon: TrendingUp,
        },
        {
            label: "Buscar proveedores con mejores precios o planes",
            value: "Buscar proveedores con mejores precios o planes" as const,
            icon: PackageSearch,
        },
    ];

    const filtersOptions = [
        { label: "Mejor precio", value: "Mejor precio" as Filters, icon: BadgeDollarSign },
        { label: "Mejores condiciones de pago", value: "Mejores condiciones de pago" as Filters, icon: CreditCard },
        { label: "Mejor tiempo de entrega", value: "Mejor tiempo de entrega" as Filters, icon: Truck },
        { label: "Mejor reputación", value: "Mejor reputación" as Filters, icon: Star },
    ];    

    useEffect(() => {
        async function fetchCountries() {
            try {
                const res = await fetch('https://countriesnow.space/api/v0.1/countries/positions');
                const data = await res.json();
                const countriesList = data.data.map((item: any) => item.name);
                setAvailableCountries(countriesList);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        }
        fetchCountries();
    }, []);

    useEffect(() => {
        async function fetchStates() {
            if (!country) return;

            try {
                const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: country }),
                });

                const data = await res.json();
                const statesList = data.data.states.map((item: any) => item.name);
                setAvailableStates(statesList);
                setStateSelected('');
                setCitySelected('');
                setAvailableCities([]);

            } catch (error) {
                console.error('Error fetching states:', error);
            }
        }
        fetchStates();
    }, [country]);

    useEffect(() => {
        async function fetchCities() {
            if (!country || !stateSelected) return;

            try {
                const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: country, state: stateSelected }),
                });

                const data = await res.json();
                const citiesList = data.data;
                setAvailableCities(citiesList);
                setCitySelected('');
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        }
        fetchCities();
    }, [stateSelected]);

    const toggleChatWindow = () => {
        if (isChatOpen) {
            resetChat();
        }
        setIsChatOpen((prev) => !prev);
    };

    const resetChat = (): void => {
        setAnswers({
            searchType: null,
            product: null,
            filters: [],
        });

        setStep(1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleAnswer = async (question: keyof Answers, answer: any): Promise<void> => {  
        const newAnswers = { ...answers, [question]: answer }; 
    
        setAnswers(newAnswers); 
    
        if (question === "searchType") {
            if (answer === "Buscar proveedores con mejores precios o planes") {
                setStep(2); 
            } else if (answer === "Tendencias de proveedores en el sector") {
                setStep(5); 
            }
            return;
        }
    
        if (newAnswers.searchType === "Buscar proveedores con mejores precios o planes") {
            if (question === "product") {
                setStep(3);
            } else if (question === "filters") {
                setStep(4);
    
                if (newAnswers.product && newAnswers.product.id) {
                    setIsLoadingResults(true);
                    try {
                        const results = await findBetterSuppliers(newAnswers.product.id, answer[0]);
                        setSupplierResults(results);
                        console.log("hola", results)
                    } catch (error) {
                        console.error('Error buscando proveedores:', error);
                        setSupplierResults([]);
                    } finally {
                        setIsLoadingResults(false);
                    }
                }
            }
        }

        if (newAnswers.searchType === "Tendencias de proveedores en el sector") {
            if (question === "region") {
                setStep(6);
            } else if (question === "companySize") {
                setStep(4);

                if (newAnswers.region && answer) { // Si ya tiene región y companySize
                    try {
                        setIsLoadingResults(true);
                        const trends = await getSectorTrends(user?.tenantId ?? '', newAnswers.region, answer);
                        console.log('Tendencias del sector:', trends);
                       
                    } catch (error) {
                        console.error('Error obteniendo tendencias:', error);
                    } finally {
                        setIsLoadingResults(false);
                    }
                }
            }
        }
    } 
    
    return (
        <div className="fixed bottom-4 right-4">

            <button 
                onClick={toggleChatWindow} 
                className="bg-homePrimary-400 text-white p-4 rounded-full shadow-lg focus:outline-none"
            >
                <span className="text-lg">💬</span>
            </button>

            {isChatOpen && (
                <div className="fixed bottom-16 right-12 bg-black shadow-lg rounded-lg w-80 h-96 border">
                    <div className="p-4">
                        <h3 className="text-lg font-bold">ChatBot</h3>
                        <div className="overflow-y-auto h-72 mb-2 mt-2">
                            
                            {step === 1 && (
                                <div className='space-y-3'>
                                    <p>1. ¿Qué tipo de búsqueda deseas realizar?</p>

                                    {searchTypeOptions.map((option) => (
                                        <CustomButton
                                            key={option.value}
                                            text={option.label}
                                            onClickButton={() => handleAnswer("searchType", option.value)}
                                            style="bg-homePrimary text-white w-full hover:bg-blue-800"
                                            icon={option.icon}
                                        />
                                    ))}
                                </div>
                            )}

                            {step === 2 && answers.searchType === "Buscar proveedores con mejores precios o planes" && (
                                <div className='space-y-3'>
                                    <p> 2. ¿Qué producto deseas consultar?</p>
                                    
                                    <SearchBarUniversal
                                        searchType="products"
                                        onAddToCart={(item) => handleAnswer("product", item as ProductDAO)}
                                        showResults={true}
                                        placeholder="Productos disponibles"
                                    />

                                    <CustomButton
                                        text="Volver"
                                        onClickButton={handleBack}
                                        style="text-gray-500 w-full"
                                        icon={ArrowLeft}
                                    />
                                </div>
                            )}

                            {step === 3 && answers.searchType === "Buscar proveedores con mejores precios o planes" && answers.product && (
                                <div className='space-y-3'>
                                    <p>3. ¿Prefieres que busquemos proveedores que ofrezcan...?</p>

                                    {filtersOptions.map((option) => (
                                        <CustomButton
                                            key={option.value}
                                            text={option.label}
                                            onClickButton={() => handleAnswer("filters", [option.value])}
                                            style="bg-homePrimary text-white w-full hover:bg-blue-800"
                                            icon={option.icon}
                                        />
                                    ))}

                                    <CustomButton
                                        text="Volver"
                                        onClickButton={handleBack}
                                        style="text-gray-500 w-full"
                                        icon={ArrowLeft}
                                    />
                                </div>
                            )}


                            {step === 4 && (
                                <div className="space-y-2">
                                    {answers.searchType === "Buscar proveedores con mejores precios o planes" ? (
                                        <>
                                            {isLoadingResults ? (
                                                <p>Buscando proveedores ideales para ti...</p>
                                            ) : supplierResults.length > 0 ? (
                                                <div className="space-y-2">
                                                    <p className="font-bold">Proveedores encontrados:</p>
                                                    {supplierResults.map((supplier, index) => (
                                                        <div key={index} className="p-2 border rounded">
                                                            <p><strong>Nombre:</strong> {supplier.name}</p>
                                                            <p><strong>Precio:</strong> {supplier.price}</p>
                                                            <p><strong>Tiempo de entrega:</strong> {supplier.deliveryTime}</p>
                                                            
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>No encontramos proveedores que cumplan con tu búsqueda.</p>
                                            )}
                                        </>
                                    ) : (
                                        <p>Gracias por tu respuesta. Estamos procesando tu búsqueda...</p>
                                    )}
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-3">
                                    <p>5. ¿En qué región opera tu empresa?</p>

                                    <select
                                        className="w-full p-2 border rounded bg-black text-white"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    >
                                        <option value="">Seleccionar país</option>
                                        {availableCountries.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>

                                    {country && (
                                        <select
                                            className="w-full p-2 border rounded bg-black text-white"
                                            value={stateSelected}
                                            onChange={(e) => setStateSelected(e.target.value)}
                                        >
                                            <option value="">Seleccionar departamento/estado</option>
                                            {availableStates.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    )}

                                    {stateSelected && (
                                        <select
                                            className="w-full p-2 border rounded bg-black text-white"
                                            value={citySelected}
                                            onChange={(e) => setCitySelected(e.target.value)}
                                        >
                                        <option value="">Seleccionar ciudad</option>
                                        {availableCities.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                        </select>
                                    )}

                                    {citySelected && (
                                        <CustomButton
                                            text="Confirmar región"
                                            onClickButton={() => {
                                                handleAnswer("region", `${citySelected}, ${stateSelected}, ${country}`);
                                            }}
                                            style="bg-homePrimary text-white w-full hover:bg-blue-800"
                                            icon={MessageSquare}
                                        />
                                    )}

                                    <CustomButton
                                        text="Volver"
                                        onClickButton={handleBack}
                                        style="text-gray-500 w-full"
                                        icon={ArrowLeft}
                                    />
                                </div>
                            )}

                            {step === 6 && (
                                <div className="space-y-3">
                                    <p>6. ¿Cuál es el tamaño de tu empresa?</p>

                                    {["Microempresa", "Pequeña empresa", "Mediana empresa", "Gran empresa"].map((size) => (
                                        <CustomButton
                                            key={size}
                                            text={size}
                                            onClickButton={() => handleAnswer("companySize", size)}
                                            style="bg-homePrimary text-white w-full hover:bg-blue-800"
                                        />
                                    ))}

                                    <CustomButton
                                        text="Volver"
                                        onClickButton={handleBack}
                                        style="text-gray-500 w-full"
                                        icon={ArrowLeft}
                                    />
                                </div>
                            )}

                        </div>

                        {step !== 4 && (
                            <CustomButton
                                text="Cerrar chat"
                                onClickButton={() => setIsChatOpen(false)}
                                style="text-gray-500 w-full"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};