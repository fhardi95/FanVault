export const metadata = {
  title: "FanVault — Product Catalog",
  other: {
    "p:domain_verify": "3efe3091c64ff196eed45a7c87c69f04",
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
