/**
 * JSON-LD Script Component
 * 
 * Renders structured data as a script tag in the document head.
 * Used by pages to inject schema.org structured data for SEO.
 * 
 * @example
 * ```tsx
 * import { JsonLd } from "@/components/seo/json-ld";
 * import { localBusinessSchema } from "@/lib/seo/json-ld-schemas";
 * 
 * export default function HomePage() {
 *   return (
 *     <>
 *       <JsonLd data={localBusinessSchema} />
 *       <main>...</main>
 *     </>
 *   );
 * }
 * ```
 */

import type { Thing, WithContext } from "schema-dts";

interface JsonLdProps {
  /** The structured data object with @context */
  data: WithContext<Thing> | WithContext<Thing>[];
  /** Optional key for React reconciliation */
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  const jsonLdString = JSON.stringify(data, null, 0);

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  );
}

/**
 * Multiple JSON-LD schemas as a graph
 * Useful when a page has multiple related schemas
 */
interface JsonLdGraphProps {
  schemas: WithContext<Thing>[];
}

export function JsonLdGraph({ schemas }: JsonLdGraphProps) {
  const graphData = {
    "@context": "https://schema.org",
    "@graph": schemas.map((schema) => {
      // Remove @context from individual schemas in graph
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { "@context": _, ...rest } = schema as unknown as Record<string, unknown>;
      return rest as unknown as Record<string, unknown>;
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphData, null, 0) }}
    />
  );
}

export default JsonLd;
