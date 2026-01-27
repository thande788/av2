import { redirect } from "next/navigation";

/**
 * Redirect /privacy-policy to /privacy for backward compatibility
 */
export default function PrivacyPolicyRedirect() {
	redirect("/privacy");
}
