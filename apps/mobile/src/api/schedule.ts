import { api } from "./client";
import type { Appointment, EventItem, Reminder } from "./types";

// مناسبت‌ها
export function listEvents() {
  return api.get<{ events: EventItem[] }>("/api/events");
}
export function createEvent(input: { description: string; jalaliMonth: number; jalaliDay: number }) {
  return api.post<{ event: EventItem }>("/api/events", input);
}
export function updateEvent(id: string, input: Partial<{ description: string; jalaliMonth: number; jalaliDay: number }>) {
  return api.patch<{ event: EventItem }>(`/api/events/${id}`, input);
}
export function deleteEvent(id: string) {
  return api.delete<{ ok: true }>(`/api/events/${id}`);
}

// جلسات و قرارها
export interface AppointmentInput {
  description: string;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;
  time: string;
  location?: string;
}
export function listAppointments() {
  return api.get<{ appointments: Appointment[] }>("/api/appointments");
}
export function createAppointment(input: AppointmentInput) {
  return api.post<{ appointment: Appointment }>("/api/appointments", input);
}
export function updateAppointment(id: string, input: Partial<AppointmentInput>) {
  return api.patch<{ appointment: Appointment }>(`/api/appointments/${id}`, input);
}
export function deleteAppointment(id: string) {
  return api.delete<{ ok: true }>(`/api/appointments/${id}`);
}

// یادآوری‌ها
export interface ReminderInput {
  description: string;
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;
  time: string;
  leadTimeMinutes?: number | null;
}
export function listReminders() {
  return api.get<{ reminders: Reminder[] }>("/api/reminders");
}
export function createReminder(input: ReminderInput) {
  return api.post<{ reminder: Reminder }>("/api/reminders", input);
}
export function updateReminder(id: string, input: Partial<ReminderInput>) {
  return api.patch<{ reminder: Reminder }>(`/api/reminders/${id}`, input);
}
export function deleteReminder(id: string) {
  return api.delete<{ ok: true }>(`/api/reminders/${id}`);
}
