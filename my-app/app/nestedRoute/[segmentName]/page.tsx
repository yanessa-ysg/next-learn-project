export default async function segmentNamePage({params}: {params: Promise<{id: string}>}) {
    const { id } = await params
    return (
        <div className="pg-amber-100 px-20">
            <div>这里是segmentNamePage</div>
            <div>id: {id}</div>
        </div>
    )
}