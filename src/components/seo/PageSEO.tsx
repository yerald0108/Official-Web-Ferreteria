interface PageSEOProps {
  title: string
  description?: string
  image?: string
  url?: string
  noIndex?: boolean
}

const SITE_NAME = 'Ferretería Online'
const DEFAULT_DESCRIPTION = 'Tu ferretería de confianza en Cuba. Herramientas, materiales y más, entregados a domicilio en todo el país.'
const DEFAULT_IMAGE = '/og-image.jpg'
const SITE_URL = 'https://ferreteria-online.cu'

export default function PageSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  noIndex = false,
}: PageSEOProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL

  return (
    <>
      {/* React 19 permite poner estos tags directamente — se inyectan en el <head> automáticamente */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta property="og:url" content={fullUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${image}`} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </>
  )
}