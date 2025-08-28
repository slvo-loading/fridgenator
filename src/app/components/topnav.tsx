import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topnav( { links }: { links: { href: string; name: string }[]} ) {
    const pathname = usePathname();

    return (
        <div>
        <nav className="bg-white shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
            🥛 🥬 🥩
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6">
              {links.map((link: any) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-gray-700 hover:text-black pb-1 transition-colors duration-200 ${
                    pathname === link.href ? "border-b-2 border-black font-medium" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        </div>
    )
}