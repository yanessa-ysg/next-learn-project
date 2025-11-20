export default function nestedRouteLayout({children} : Readonly<{children: React.ReactNode}>) {
    return <section>
        {children}
    </section>
}