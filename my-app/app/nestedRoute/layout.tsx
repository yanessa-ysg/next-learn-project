export default function nestedRouteLayout({children} : Readonly<{children: React.ReactNode}>) {
    return <section className="bg-red-400 px-20">
        <div className="text-3xl">这是一个嵌套路由页面</div>
        <div className="text-2xl">这里是nestedRoutelayout</div>
        {children}
    </section>
}