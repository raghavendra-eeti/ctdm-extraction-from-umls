function extractUsecaseCtdm (data) {
    
    let ctdm = {}
    let usecases = {}
    let agents = {}

    data.split('\n').forEach(data_line => {
        const statement = data_line.trim()

        if (statement.startsWith('agent')) {
            let [name, id] = statement.split('=')[1].split('~')
            agents[id] = name
        }

        else if (statement.startsWith('usecase')) {
            let [name, id] = statement.split('=')[1].split('~')
            usecases[id] = name
        }

        else if (statement.includes('--')) {
            let [agent, usecase] = statement.split('--')
            let parameter = usecases[usecase]
            ctdm[parameter] = []
        }

        else if (statement.includes('-e>')) {
            let [extender_usecase, usecase] = statement.split('-e>')
            let value = usecases[extender_usecase]
            let parameter = usecases[usecase]
            if (!(parameter in ctdm)) 
                ctdm[parameter] = []
            ctdm[parameter].push(value)
        }
    })
    console.log(agents)
    console.log(usecases)
    console.log(ctdm)
    return ctdm
}