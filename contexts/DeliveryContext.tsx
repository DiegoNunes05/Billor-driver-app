// contexts/DeliveryContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Defina a interface para o tipo de entrega
export interface Delivery {
  id: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryComplement: string;
  deliveryCity: string;
  deliveryZipCode: string;
  packageDescription: string;
  deliveryInstructions: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: Date;
  totalDistance?: number; // em km
}

// Interface para o contexto
interface DeliveryContextData {
  deliveries: Delivery[];
  addDelivery: (
    delivery: Omit<Delivery, "id" | "status" | "createdAt">
  ) => Promise<void>;
  updateDelivery: (id: string, data: Partial<Delivery>) => Promise<void>;
  totalDeliveries: number;
  totalDistance: number;
  loading: boolean;
}

// Criando o contexto
const DeliveryContext = createContext<DeliveryContextData>(
  {} as DeliveryContextData
);

// Props para o provider
interface DeliveryProviderProps {
  children: ReactNode;
}

// Provider component
export function DeliveryProvider({children}: DeliveryProviderProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar entregas iniciais do Firebase
  useEffect(() => {
    setLoading(true);

    // Referência para a coleção de entregas
    const deliveriesRef = collection(db, "deliveries");

    // Criar uma query ordenada por data de criação (mais recentes primeiro)
    const q = query(deliveriesRef, orderBy("createdAt", "desc"));

    // Listener para atualizações em tempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deliveriesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Convertendo timestamp do Firestore para Date
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Delivery;
        });

        setDeliveries(deliveriesData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar entregas:", error);
        setLoading(false);
      }
    );

    // Limpeza do listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Adicionar nova entrega
  const addDelivery = async (
    deliveryData: Omit<Delivery, "id" | "status" | "createdAt">
  ) => {
    try {
      // Preparar os dados para o Firestore
      const newDeliveryData = {
        ...deliveryData,
        status: "pending",
        createdAt: new Date(),
        totalDistance: Math.floor(Math.random() * 10) + 1, // Simulando uma distância aleatória
      };

      // Adicionar ao Firestore
      await addDoc(collection(db, "deliveries"), newDeliveryData);

      // Não precisamos atualizar o estado manualmente porque o listener onSnapshot fará isso
    } catch (error) {
      console.error("Erro ao adicionar entrega:", error);
      throw error;
    }
  };

  // Atualizar uma entrega existente
  const updateDelivery = async (id: string, data: Partial<Delivery>) => {
    try {
      const deliveryRef = doc(db, "deliveries", id);
      await updateDoc(deliveryRef, data);

      // Não precisamos atualizar o estado manualmente porque o listener onSnapshot fará isso
    } catch (error) {
      console.error("Erro ao atualizar entrega:", error);
      throw error;
    }
  };

  // Calcular totais para o resumo
  const totalDeliveries = deliveries.length;
  const totalDistance = deliveries.reduce(
    (acc, delivery) => acc + (delivery.totalDistance || 0),
    0
  );

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        addDelivery,
        updateDelivery,
        totalDeliveries,
        totalDistance,
        loading,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

// Hook para usar o contexto
export function useDelivery() {
  const context = useContext(DeliveryContext);

  if (!context) {
    throw new Error("useDelivery deve ser usado dentro de um DeliveryProvider");
  }

  return context;
}
