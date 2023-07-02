/* eslint-disable @typescript-eslint/no-misused-promises */
import Head from "next/head";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { getServices } from "~/server/service-builder";

export const getServerSideProps: GetServerSideProps<{
  teamId: string;
}> = async (ctx: GetServerSidePropsContext) => {
  if (!ctx.params || !ctx.params.teamId || Array.isArray(ctx.params.teamId))
    return { notFound: true };

  try {
    const auth = getAuth(ctx.req);
    const { authGuard } = getServices();

    const { team } = await authGuard.authoriseByTeamMember(
      auth.userId ?? null,
      ctx.params.teamId
    );

    return { props: { teamId: team.id } };
  } catch (ex) {
    console.error(ex);
    return {
      notFound: true,
    };
  }
};

export default function CreateTeamPage({
  teamId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const query = api.teams.getTeamById.useQuery({ id: teamId });
  const teamMembersQuery = api.teams.getTeamMembersById.useQuery({
    id: teamId,
  });

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
            <p>{query.data?.id}</p>
            <p>{query.data?.name}</p>
            {teamMembersQuery.data &&
              teamMembersQuery.data.map((teamMember) => (
                <p key={teamMember.user.id}>
                  <span>{teamMember.user.id}</span>
                  {teamMember.isActive && <span>is active</span>}
                  {teamMember.isAdmin && <span>is admin</span>}
                  {teamMember.isOwner && <span>is owner</span>}
                </p>
              ))}
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
