import React, {createContext, useState, useContext, useEffect} from "react";
import {notificationsApi} from "@/services/api";
import {useAuth} from "@/hooks/useAuth";

// Definição da interface para notificações
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  loadId?: string;
  timestamp: string;
  read: boolean;
}

// Interface para o contexto
interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
}

// Criação do contexto
const NotificationContext = createContext<NotificationContextData>(
  {} as NotificationContextData
);

// Provider do contexto
export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const {user} = useAuth(); // Obter o usuário atual

  // Contar notificações não lidas
  const countUnread = (notificationList: Notification[]) => {
    const count = notificationList.filter(
      (notification) => !notification.read
    ).length;
    setUnreadCount(count);
  };

  const fetchNotifications = async () => {
    try {
      // Se o usuário não estiver logado, não busque notificações
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Use a função getByDriver para buscar as notificações do usuário
      const response = await notificationsApi.getByDriver(user.uid);
      const notificationsData = response.data;

      setNotifications(notificationsData);
      countUnread(notificationsData);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      // Em caso de erro, mantenha as notificações atuais
    }
  };

  // Função para marcar como lida agora usa a API
  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);

      // Atualiza o estado local após sucesso na API
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? {...notification, read: true} : notification
      );

      setNotifications(updatedNotifications);
      countUnread(updatedNotifications);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // Função para marcar todas como lidas
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Como você ainda não tem essa função na API, vamos implementá-la localmente
      // chamando markAsRead para cada notificação não lida
      const unreadNotifications = notifications.filter((n) => !n.read);

      for (const notification of unreadNotifications) {
        await notificationsApi.markAsRead(notification.id);
      }

      // Atualiza o estado local após sucesso
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }));

      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error);
    }
  };

  // Função para excluir notificação
  const deleteNotification = async (id: string) => {
    try {
      // Como você ainda não tem essa função na API, recomendamos adicionar:
      // await notificationsApi.delete(id);

      // Por enquanto, vamos apenas atualizar o estado local
      const updatedNotifications = notifications.filter(
        (notification) => notification.id !== id
      );

      setNotifications(updatedNotifications);
      countUnread(updatedNotifications);
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
    }
  };

  // Função para atualizar notificações
  const refreshNotifications = () => {
    fetchNotifications();
  };

  // Buscar notificações ao iniciar e quando o usuário mudar
  useEffect(() => {
    fetchNotifications();
  }, [user]); // Adicione user como dependência

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personalizado
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification deve ser usado dentro de um NotificationProvider"
    );
  }

  return context;
};
