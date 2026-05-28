import { useContext } from "react";
import { NotificationsContext } from "../contexts/NotificationsContext";

export default function useNotifications() {
  return useContext(NotificationsContext);
}
