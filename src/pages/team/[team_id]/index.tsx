import Head from "next/head";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { GetServerSideProps } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { getServices } from "~/server/service-builder";
import { prisma } from "~/server/db";
import { clerkClient } from "@clerk/nextjs/server";
import { useCurrentTeam } from "~/hooks/use-current-team";

export default function CreateTeamPage() {
  const { team } = useCurrentTeam();

  return (
    <>
      <Head>
        <title>Create New Team</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="dark flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <Card className="p-5">
          <CardHeader className="pb-0">
            <h1 className="scroll-m-20 text-center text-2xl font-extrabold tracking-tight lg:text-3xl">
              Create Team
            </h1>
          </CardHeader>
          <CardContent className="py-20">
            <p>{team?.id}</p>
            <p>{team?.name}</p>
          </CardContent>
          <CardFooter className="flex flex-col justify-center gap-5">
            <Button size="lg" className="w-96">
              Create team
            </Button>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.params || !ctx.params.team_id || Array.isArray(ctx.params.team_id))
    return { notFound: true };

  try {
    const auth = getAuth(ctx.req);
    const { authGuard } = getServices(prisma, clerkClient.users);

    await authGuard.authoriseByTeamMember(
      auth.userId ?? null,
      ctx.params.team_id
    );

    return { props: {} };
  } catch (ex) {
    return {
      notFound: true,
    };
  }
};
