#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import subprocess

def run_command(command):
    """执行命令并显示输出"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            encoding='utf-8',
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"错误: {e}")
        return False

def main():
    print("=" * 50)
    print("       Git 快速推送工具")
    print("=" * 50)
    print()

    # 获取提交信息
    commit_message = input("请输入提交信息: ").strip()

    if not commit_message:
        print("错误: 提交信息不能为空！")
        input("\n按回车键退出...")
        return

    print()
    print("-" * 30)
    print("1. 添加所有文件到暂存区...")
    if not run_command("git add ."):
        print("git add 失败！")
        input("\n按回车键退出...")
        return

    print()
    print("-" * 30)
    print(f"2. 提交: {commit_message}")
    if not run_command(f'git commit -m "{commit_message}"'):
        print("git commit 失败！")
        input("\n按回车键退出...")
        return

    print()
    print("-" * 30)
    print("3. 推送到远程仓库...")
    if not run_command("git push origin main"):
        print("git push 失败！")
        input("\n按回车键退出...")
        return

    print()
    print("=" * 50)
    print("✓ 推送成功！")
    print("=" * 50)
    input("\n按回车键退出...")

if __name__ == "__main__":
    main()
