import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = await getCurrentUser()
    if (!user && to.path !== '/login') {
        return navigateTo({ path: '/login' })
    }
})