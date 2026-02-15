/**
 * Server Actions Barrel Export
 */

export { submitContactForm, type ContactFormState } from "./contact";
export { submitApplication, type ApplicationFormState } from "./application";
export { submitCareInquiry, type CareInquiryFormState } from "./care-inquiry";

// Worker management actions
export {
  approveWorker,
  rejectWorker,
  updateWorkerStatus,
  updateComplianceStatus,
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

// Shift booking actions (from SMS links)
export {
  bookShiftFromLink,
  cancelShiftBooking,
} from "./shift-booking";
