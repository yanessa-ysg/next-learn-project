export default function segmentNameLayout({children} : Readonly<{children: React.ReactNode}>) {
    return (
        <div className="bg-Amber-300 px-20">
            <div>这里是segmentNameLayout</div>
            {children}
        </div>
    )
}