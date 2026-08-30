export const metadata = {
  title: "FanVault — Product Catalog",
  other: {
    "p:domain_verify": "12iD3XhCQfYF5sf6FaMrzrGFxzrKJ4u85L",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
