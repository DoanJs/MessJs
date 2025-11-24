// export const sortMessages = (allMessages: any[]) => {
//   // ⚡ 4️⃣ Sắp xếp theo thời gian
//   return allMessages.sort((a: any, b: any) => {
//     const aTime =
//       typeof a.createAt === 'object' && a.createAt?.toMillis
//         ? a.createAt.toMillis()
//         : Number(a.createAt);
//     const bTime =
//       typeof b.createAt === 'object' && b.createAt?.toMillis
//         ? b.createAt.toMillis()
//         : Number(b.createAt);
//     return aTime - bTime;
//   });
// };
