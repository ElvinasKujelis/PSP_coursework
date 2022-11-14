const canvas = document.querySelector('canvas')
const scoreElement = document.querySelector('#scoreElement')
const scoreTxt = document.querySelector('#scoreTxt')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }
        this.opacity = 1
        const image = new Image()
        image.src = './img/spaceship-js.png'
        image.onload = () => {
            const scale = .15
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale

            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }
    }

    draw() {
        c.globalAlpha = this.opacity

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        ) 
    }

    update() {
        if(this.image) {
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}

class Projectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Invader {
    constructor({position}) {
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = './img/invader.png'
        image.onload = () => {
            const scale = .075
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale

            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    draw() {
        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        ) 
    }

    update({velocity}) {
        if(this.image) {
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }
    
    shoot(InvaderProjectiles) {
        InvaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2, 
                y: this.position.y + this.height
            },
            velocity: {
                x: 0, 
                y: 5
            }
        }))
    }
}

class InvaderProjectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'green'
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0,
        }

        this.velocity = {
            x: 5,
            y: 0
        }

        this.invaders = []

        const columns = Math.floor(Math.random() * 10 + 5) 
        const rows = Math.floor(Math.random() * 4 + 1) 
        this.width = columns * 76

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                this.invaders.push(
                    new Invader({
                        position: {
                        x: i * 76, 
                        y: j * 76
                        }
                    })
                )
            }   
        }
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.velocity.y = 0 
        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) { 
            this.velocity.x = -this.velocity.x
            this.velocity.y = 76
        }
    }
}

const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    mouse :{
        pressed: false
      }
}

let frames = 0
let randomInterval = Math.floor((Math.random() * 250) + 250)
let score = 0
let game = {
    over: false,
    active: false
}

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player.update()


    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.radius >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            }, 0)
        } else invaderProjectile.update()

        if (invaderProjectile.position.y + invaderProjectile.radius >= player.position.y 
            && invaderProjectile.position.x + invaderProjectile.radius >= player.position.x 
            && invaderProjectile.position.x <= player.position.x + player.width) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
                player.opacity = 0
                game.over = true
                scoreElement.innerHTML = `You lost, your score is ${score}`
                scoreTxt.innerHTML = ""
                projectiles.length = 0
            }, 0)
        }
    })

    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) 
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0);
        else projectile.update()
    })

    grids.forEach((grid, gridIndex) => {
        grid.update()

        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }   
        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity})

            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height 
                    && projectile.position.x + projectile.radius >= invader.position.x 
                    && projectile.position.x - projectile.radius <= invader.position.x + invader.width
                    && projectile.position.y + projectile.radius >= invader.position.y) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(
                            (invader2) => invader2 === invader
                        ) 
                        const projectileFound = projectiles.find(
                            (projectile2) => projectile2 === projectile
                        )

                        if (invaderFound && projectileFound) { 
                            score+=100
                            scoreElement.innerHTML = score
                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0] 
                                const lastInvader = grid.invaders[grid.invaders.length - 1] 

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                                grid.position.x = firstInvader.position.x
                            } else { 
                                grids.splice(gridIndex, 1)
                            }
                        } 
                    }, 0)
                }
            })
        })
    })

    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -7
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 7
    } else {
        player.velocity.x = 0
    }
    if (frames % randomInterval === 0) {
        grids.push(new Grid())
        frames = 0
        randomInterval = Math.floor((Math.random() * 250) + 250)
    }

    frames++ 

}
animate()

addEventListener('keydown', ({key}) => {
    switch(key) {
        case 'a':
            keys.a.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
    }
})

document.addEventListener('mouseup', (e) => {

    if (game.over) {return}
    switch (e.button) {
        case 0:
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y,
                },
                velocity: {
                    x: 0,
                    y: -20,  
                }
            }))
            break;
    
        default:
            break;
    }
})

addEventListener('keyup', ({key}) => {
    switch(key) {
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})