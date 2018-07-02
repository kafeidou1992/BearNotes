var Events = (function(){
    var events = {}
    function on(eve,handler){
       events[eve] = events[eve] || []
       events[eve].push({handler: handler})
    }
    function fire(eve,val){
        if(!events[eve]){
            return
        }
        events[eve].forEach(function(ele){
            ele.handler(val)
        })
    }
    return {
        on: on,
        fire: fire
    }
})()
module.exports = Events