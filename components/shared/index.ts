// Loading components
export {
  LoadingSpinner,
  LoadingDots,
  LoadingOverlay,
  type LoadingSpinnerProps,
  type LoadingDotsProps,
  type LoadingOverlayProps,
} from "./loading-spinner";

// Skeleton patterns
export {
  SkeletonCard,
  SkeletonAvatar,
  SkeletonTestimonial,
  SkeletonCaregiver,
  SkeletonService,
  SkeletonPage,
  type SkeletonCardProps,
  type SkeletonAvatarProps,
  type SkeletonTestimonialProps,
  type SkeletonCaregiverProps,
  type SkeletonServiceProps,
} from "./skeleton-patterns";

// Optimized image component
export {
  OptimizedImage,
  aspectRatios,
  sizePresets,
  generateBlurPlaceholder,
  type AspectRatio,
  type SizePreset,
} from "./optimized-image";

// Motion components
export {
  MotionWrapper,
  StaggerContainer,
  StaggerItem,
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  defaultTransition,
} from "./motion-wrapper";

// Cookie consent
export {
  CookieConsent,
  useCookieConsent,
  hasAnalyticsConsent,
  type ConsentLevel,
} from "./cookie-consent";

// Chat widget
export { ChatWidget } from "./chat-widget";
export { LazyChatWidget } from "./lazy-chat-widget";

// File upload
export { FileUpload } from "./file-upload";
