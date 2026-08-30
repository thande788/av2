/**
 * Server Actions Barrel Export
 */

export { submitContactForm, type ContactFormState } from "./contact";
export { submitApplication, type ApplicationFormState } from "./application";
export { submitCareInquiry, type CareInquiryFormState } from "./care-inquiry";
export { submitChatMessage } from "./chat-widget";

// Audit log actions
export {
  logAuditEvent,
  getEntityAuditLog,
  getRecentAuditLog,
  getFilteredAuditLog,
  bulkUpdateApplicationStatus,
  bulkMarkContactsRead,
  bulkUpdateInquiryStatus,
  bulkDeleteContacts,
  bulkDeleteInquiries,
} from "./audit-log";

// Admin email actions
export {
  sendAdminEmail,
  getEntityEmailHistory,
  type AdminEmailData,
  type AdminEmailResult,
} from "./admin-email";

// Site settings actions
export {
  getSiteSettings,
  updateSiteSettings,
  type SiteSettings,
} from "./site-settings";

// Email templates (shared data — re-exported from types to avoid restricted import)
export type { EmailTemplate } from '@/types';

// Notification actions
export {
  getUnreadNotificationCount,
  getRecentNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createInAppNotification,
} from "./notifications";

// Worker management actions
export {
  approveWorker,
  rejectWorker,
  updateWorkerStatus,
  updateComplianceStatus,
  updateWorker,
} from "./workers";

// Shift management actions (Admin)
export {
  sendBookingRequest,
  confirmBooking,
  cancelShift,
  completeShift,
  updateShiftStatus,
} from "./shifts";

// Employee shift actions
export {
  acceptShiftBooking,
  declineShiftBooking,
  checkInToShift,
  checkOutFromShift,
} from "./employee-shifts";

// Compliance document actions
export {
  uploadComplianceDocument,
  deleteComplianceDocument,
  approveComplianceDocument,
  rejectComplianceDocument,
  getWorkerComplianceDocuments,
  getPendingComplianceDocuments,
  getExpiringComplianceDocuments,
  type UploadDocumentResult,
} from "./compliance";

// Timesheet management actions
export {
  approveTimesheet,
  rejectTimesheet,
} from "./timesheets";

// Worker registration actions
export {
  registerWorker,
  linkClerkToWorker,
  type WorkerRegistrationState,
} from "./worker-registration";

// SMS notification actions
export {
  sendShiftNotification,
  sendShiftConfirmation,
  sendShiftCancellation,
  sendShiftNotificationToWorkers,
  type NotificationResult,
} from "./sms-notifications";

// WhatsApp actions
export {
  sendWhatsAppTemplateToUser,
  type SendWhatsAppTemplateActionInput,
  type SendWhatsAppTemplateActionResult,
} from "./whatsapp";

// Shift booking actions (from SMS links)
export {
  bookShiftFromLink,
  cancelShiftBooking,
} from "./shift-booking";

// Shift review actions
export {
  submitShiftReview,
  publishReview,
  unpublishReview,
  getCompletedShiftsAwaitingReview,
  getClientReviews,
} from "./shift-reviews";

// Payroll actions
export {
  calculatePayroll,
  generatePayrollCSV,
  markTimesheetsProcessed,
  type PayrollEntry,
  type PayrollSummary,
} from "./payroll";

// Worker profile (marketing) actions
export {
  submitMarketingProfile,
  saveMarketingProfileDraft,
  uploadMarketingPhoto,
} from "./worker-profile";

// Client testimonial actions
export {
  submitClientTestimonial,
  type ClientTestimonialData,
} from "./testimonials";

// Availability management
export {
  getMyAvailability,
  toggleAvailability,
  updateBulkAvailability,
  checkAvailabilityConflicts,
  type AvailabilitySlot,
} from "./availability";

// Shift broadcast controls
export {
  previewBroadcast,
  sendTargetedBroadcast,
  getBroadcastFilterOptions,
  type BroadcastFilter,
  type BroadcastPreview,
} from "./shift-broadcast";

// Caregiver-client matching
export {
  calculateMatchScore,
  getRankedMatches,
  type MatchScore,
} from "./matching";

// Shift notes & handoff
export {
  addShiftNote,
  getShiftNotes,
  getHandoffNotes,
  toggleNotePin,
  searchShiftNotes,
  type ShiftNoteData,
} from "./shift-notes";

// Emergency & escalation
export {
  reportEmergencyIncident,
  getIncidents,
  resolveIncident,
  getClientEmergencyContacts,
  type EmergencyIncidentData,
} from "./emergency";

// Automated shift reminders
export {
  sendShiftReminders,
} from "./shift-reminders";

// Client satisfaction surveys
export {
  submitSatisfactionSurvey,
  sendSurveyLink,
  getSatisfactionMetrics,
  type SatisfactionSurveyData,
} from "./satisfaction";

// Shift swap requests
export {
  requestShiftSwap,
  acceptSwapRequest,
  approveSwapRequest,
  rejectSwapRequest,
  getPendingSwapRequests,
  getMySwapRequests,
  type SwapRequestData,
} from "./shift-swaps";

// Invoice payments
export {
  createInvoiceCheckoutSession,
  handlePaymentComplete,
  getClientPaymentHistory,
  getClientInvoiceSummary,
} from "./payments";
