"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import styles from "../styles/Header.module.scss";

export const Header: React.FC = () => {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>RecipeRank</h1>
      <nav className={styles.nav}>
        <Link href="/" className={pathname === "/" ? styles.active : ""}>
          Home
        </Link>
        <Link
          href="/recipes/new"
          className={pathname === "/recipes/new" ? styles.active : ""}
        >
          Add Recipe
        </Link>
      </nav>
    </header>
  );
};
