/* globals marked:false */

$.fn.shake = function shake(settings) {
  const config = { ...settings }
  if (typeof config.interval === "undefined") {
    config.interval = 100
  }

  if (typeof config.distance === "undefined") {
    config.distance = 10
  }

  if (typeof config.times === "undefined") {
    config.times = 4
  }

  if (typeof settings.complete === "undefined") {
    config.complete = function complete() {}
  }

  $(this).css("position", "relative")

  for (let iter = 0; iter < settings.times + 1; iter += 1) {
    $(this).animate(
      { left: iter % 2 === 0 ? settings.distance : settings.distance * -1 },
      settings.interval
    )
  }

  $(this).animate({ left: 0 }, settings.interval, settings.complete)
}

$(() => {
  $(".level-text").html(marked($(".level-text").html()))

  const input = $('input[name="answer"]')
  function nextLevel(href) {
    let redirect = href
    if (redirect.slice(-1) === "/") {
      redirect = redirect.slice(0, -1)
    }
    redirect = redirect.split("/")
    const number = parseInt(redirect.pop(), 10)
    if (Number.isNaN(number)) {
      return null
    }
    redirect.push(number + 1)
    return redirect.join("/")
  }

  $("form").submit(e => {
    e.preventDefault()
    $.ajax({
      method: "POST",
      data: {
        answer: input.val()
      },
      success(data) {
        if (data.isCorrect) {
          window.location.href = nextLevel(window.location.href)
        } else {
          input.shake()
        }
      }
    })
  })
})
