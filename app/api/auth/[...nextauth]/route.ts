import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        session: async ({ session, user }) => {
            if (session?.user) {
                // @ts-ignore
                session.user.id = user.id;
                // @ts-ignore
                session.user.credits = user.credits;
            }
            return session;
        },
    },
    pages: {
        signIn: '/', // 自定义登录页路径，这里暂时重定向到首页，或者我们可以做一个专门的登录页
        error: '/', // 错误页
    },
    debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
