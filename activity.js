const ACTIVITY_KEYWORDS = 'If.EndIf.Start.End.Fork.Sync'

function extractActivityCtdm (data) {
    let ctdm = {}
    let parameter_stack = []
    let last_parameter

    data.split('\n').forEach(data_line => {
        const statement = data_line.trim()
        
        if (statement.length > 0) {
            if (ACTIVITY_KEYWORDS.includes(statement)) {
                if (statement === 'If') {
                    parameter_stack.push(last_parameter)
                } else if (statement === 'EndIf') {
                    parameter_stack.pop()
                }
            }
    
            else if (statement[0] === '[' && statement[statement.length - 1] === ']') {
                let value = statement.slice(1, statement.length - 1)
                let parameter = parameter_stack[parameter_stack.length - 1]
                if (!(parameter in ctdm))
                    ctdm[parameter] = []
                ctdm[parameter].push(value)
            }
    
            else {
                last_parameter = statement.split('~')[0]
            }
        }

    })

    return ctdm
}