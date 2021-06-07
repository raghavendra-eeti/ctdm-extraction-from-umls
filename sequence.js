
function statement_sw_obj_assignment (statement, objects) {
    for (let o = 1; o <= objects; o++) {
        if (statement.startsWith('id' + o + ':')) {
            return o
        }
    }
    return false
}

function condition_has_operator (conditon) {
    if (conditon.includes('=='))
        return '=='
    if (conditon.includes('>='))
        return '>='
    if (conditon.includes('<='))
        return '<='
    if (conditon.includes('!='))
        return '!='
    if (conditon.includes('>'))
        return '>'
    if (conditon.includes('<'))
        return '<'
    if (conditon.includes('='))
        return '='
    
    return false
}


function extractSequenceCtdm (data) {

    let ctdm = {}
    let objects = 0
    let sync_message_cache = {}
    let combined_fragment_stack = [0]
    let combined_fragment_conditions = {}
    
    const data_lines = data.split('\n')
    data_lines.forEach(data_line => {
        data_line.split(';').forEach(statement_base => {

            const statement = statement_base.trim()
            if (statement.startsWith('obj')) {
                name = statement.slice(4).split('~')[0]
                objects++
                combined_fragment_stack.push([]) 
            }

            else if (statement.includes('->>>')) {
                let [path, parameter] = statement.split(':')
                let [frm, to] = path.split('->>>')
                frm = frm.slice(2) * 1
                to = to.slice(2) * 1
                if (!(frm in sync_message_cache))
                    sync_message_cache[frm] = {}
                sync_message_cache[frm][to] = parameter
            }
            

            else if (statement.includes('.>')) {
                let [path, values_s] = statement.split(':')
                let [frm, to] = path.split('.>')
                let values = values_s.split('/')
                frm = frm.slice(2) * 1
                to = to.slice(2) * 1
                parameter = sync_message_cache[to][frm]
                if (!(parameter in ctdm))
                    ctdm[parameter] = []
                ctdm[parameter] = ctdm[parameter].concat(values)
            }

            else if (statement.startsWith('combinedFragment')) {
                let fd = statement.slice(17)
                let fd_split = fd.split(' ')
                let frm = fd_split[fd_split.length - 2]
                let to = fd_split[fd_split.length - 1]
                frm = frm.slice(2) * 1
                to = to.slice(2) * 1
                let id = fd.split('~')[1].split()[0]
                for (let o = frm; o <= to; o++)
                    combined_fragment_stack[o].push(id)
            }

            else if (statement_sw_obj_assignment(statement, objects)) {
                let o = statement_sw_obj_assignment(statement, objects)
                let condition = statement.slice(3 + String(o).length)
                let operator = condition_has_operator(condition)
                if (operator) {

                    let parameter = condition.split(operator)[0].slice(1)

                    if (!(parameter in ctdm)) {
                        ctdm[parameter] = []
                    }
                    ctdm[parameter].push(condition)
                }
                else {
                    let id = combined_fragment_stack[o][combined_fragment_stack[o].length - 1]
                    if (!(id in combined_fragment_conditions))
                        combined_fragment_conditions[id] = []
                    condition = condition.slice(1, condition.length - 1)
                    combined_fragment_conditions[id].push(condition)
                }
            }

            else if (statement.startsWith('--=')) {
                id = statement.slice(3)
                for (let o = 1; o <= objects; o++) {
                    if (combined_fragment_stack[o] && combined_fragment_stack[o][combined_fragment_stack[o].length - 1] == id) {
                        combined_fragment_stack[o].pop()
                    }
                }
            }


        })
    }) 

    for (let id in combined_fragment_conditions) {
        let parameter = combined_fragment_conditions[id][0]
        let values = combined_fragment_conditions[id]
        ctdm[parameter] = values
    }

    for (let parameter in ctdm) {
        ctdm[parameter] = Array.from(new Set(ctdm[parameter]))
    }

    return ctdm
}