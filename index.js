const { App } = require("@slack/bolt");
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

// SLACH のアカウント ID
// ※ @foo の foo ではない。
const groupA = [
  "<@Uxxxxxxxxxx>", // @foo
  "<@Uyyyyyyyyyy>", // @bar
].join(" ");
// ゲストアカウントが所属しないグループは空の配列にしておく
const groupB = [
].join(" ")

// 反応させるメンショングループのリスト
// id: メンショングループの ID
// name: メンショングループの名前
// members: [optional] ゲストアカウントIDの配列
const mentionGroups = [
  { id: "Sxxxxxxxxxx", name: "group-a", members: groupA },
  { id: "Syyyyyyyyyy", name: "group-b", members: groupB },
];

const sendToSlack = async (message, context, text) => {
  try {
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: message.channel,
      thread_ts: message.event_ts,
      text: text,
    });
  } catch (error) {
    console.error(error);
  }
};

mentionGroups.forEach(({ id, name, members }) => {
  // input : group-mention
  // output: @group-mention @member1 @member2 ...
  app.message(new RegExp(`(^(?!@)${name})(\\s|$)`, "m"), ({ message, context }) => {
    sendToSlack(message, context, `<!subteam^${id}|@${name}> ${members || ""}`);
  });

  // input : @group-mention
  // output: group-mention @member1 @member2 ...
  app.message(new RegExp(id), ({ message, context }) => {
    sendToSlack(message, context, `${name} ${members || ""}`);
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
