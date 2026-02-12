#!/bin/bash

# Maths.com - Git Workflow Helper
# Usage: ./git-workflow.sh [command] [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo -e "${BLUE}🚀 Maths.com Git Workflow Helper${NC}"
    echo ""
    echo "Usage: ./git-workflow.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start-feature <name>     Start a new feature branch"
    echo "  start-hotfix <name>      Start a hotfix branch"
    echo "  finish-feature           Merge feature to develop"
    echo "  finish-hotfix            Merge hotfix to main and develop"
    echo "  release <version>        Create a release tag"
    echo "  sync                     Sync all branches"
    echo "  status                  Show current status"
    echo "  help                     Show this help"
    echo ""
    echo "Examples:"
    echo "  ./git-workflow.sh start-feature user-authentication"
    echo "  ./git-workflow.sh start-hotfix login-bug"
    echo "  ./git-workflow.sh finish-feature"
    echo "  ./git-workflow.sh release v1.1.0"
}

# Get current branch
get_current_branch() {
    git branch --show-current
}

# Check if working directory is clean
is_clean() {
    if [ -n "$(git status --porcelain)" ]; then
        return 1
    else
        return 0
    fi
}

# Sync all branches
sync_branches() {
    echo -e "${BLUE}📥 Syncing all branches...${NC}"
    
    # Sync main
    echo -e "${YELLOW}→ Syncing main...${NC}"
    git checkout main
    git pull origin main
    
    # Sync develop
    echo -e "${YELLOW}→ Syncing develop...${NC}"
    git checkout develop
    git pull origin develop
    
    echo -e "${GREEN}✅ All branches synced!${NC}"
}

# Start a new feature
start_feature() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}❌ Please provide a feature name${NC}"
        echo "Usage: ./git-workflow.sh start-feature <name>"
        exit 1
    fi
    
    echo -e "${BLUE}🌱 Starting new feature: $feature_name${NC}"
    
    # Ensure we're on develop and up-to-date
    git checkout develop
    git pull origin develop
    
    # Create feature branch
    local branch_name="feature/$feature_name"
    git checkout -b "$branch_name"
    
    echo -e "${GREEN}✅ Created feature branch: $branch_name${NC}"
    echo -e "${YELLOW}💡 Now you can start working on your feature!${NC}"
}

# Start a hotfix
start_hotfix() {
    local hotfix_name=$1
    if [ -z "$hotfix_name" ]; then
        echo -e "${RED}❌ Please provide a hotfix name${NC}"
        echo "Usage: ./git-workflow.sh start-hotfix <name>"
        exit 1
    fi
    
    echo -e "${RED}🚨 Starting hotfix: $hotfix_name${NC}"
    
    # Ensure we're on main and up-to-date
    git checkout main
    git pull origin main
    
    # Create hotfix branch
    local branch_name="hotfix/$hotfix_name"
    git checkout -b "$branch_name"
    
    echo -e "${GREEN}✅ Created hotfix branch: $branch_name${NC}"
    echo -e "${YELLOW}⚡ Make your fix quickly and commit!${NC}"
}

# Finish a feature
finish_feature() {
    local current_branch=$(get_current_branch)
    
    if [[ ! $current_branch == feature/* ]]; then
        echo -e "${RED}❌ You're not on a feature branch!${NC}"
        echo "Current branch: $current_branch"
        exit 1
    fi
    
    if ! is_clean; then
        echo -e "${RED}❌ Working directory is not clean!${NC}"
        echo "Please commit or stash your changes first."
        exit 1
    fi
    
    echo -e "${BLUE}🏁 Finishing feature: $current_branch${NC}"
    
    # Push feature branch
    git push origin "$current_branch"
    
    echo -e "${YELLOW}📝 Creating Pull Request...${NC}"
    echo "Branch: $current_branch → develop"
    echo "Please create a Pull Request on GitHub with:"
    echo "  - Title: $(echo $current_branch | sed 's/feature\///')"
    echo "  - Description: Describe your changes"
    echo "  - Reviewers: Add reviewers if needed"
    echo ""
    echo -e "${GREEN}✅ Feature branch pushed and ready for PR!${NC}"
}

# Finish a hotfix
finish_hotfix() {
    local current_branch=$(get_current_branch)
    
    if [[ ! $current_branch == hotfix/* ]]; then
        echo -e "${RED}❌ You're not on a hotfix branch!${NC}"
        echo "Current branch: $current_branch"
        exit 1
    fi
    
    if ! is_clean; then
        echo -e "${RED}❌ Working directory is not clean!${NC}"
        echo "Please commit or stash your changes first."
        exit 1
    fi
    
    echo -e "${RED}🚨 Finishing hotfix: $current_branch${NC}"
    
    # Push hotfix branch
    git push origin "$current_branch"
    
    echo -e "${YELLOW}📝 Creating Pull Request...${NC}"
    echo "Branch: $current_branch → main"
    echo "Please create a Pull Request on GitHub with:"
    echo "  - Title: $(echo $current_branch | sed 's/hotfix\///')"
    echo "  - Description: Describe the hotfix"
    echo "  - Reviewers: Add reviewers if needed"
    echo ""
    echo -e "${YELLOW}⚠️  After merging to main, also merge to develop!${NC}"
    echo -e "${GREEN}✅ Hotfix branch pushed and ready for PR!${NC}"
}

# Create a release
create_release() {
    local version=$1
    if [ -z "$version" ]; then
        echo -e "${RED}❌ Please provide a version number${NC}"
        echo "Usage: ./git-workflow.sh release <version>"
        echo "Example: ./git-workflow.sh release v1.1.0"
        exit 1
    fi
    
    echo -e "${BLUE}🏷️  Creating release: $version${NC}"
    
    # Ensure we're on main and up-to-date
    git checkout main
    git pull origin main
    
    # Create tag
    git tag -a "$version" -m "Release $version"
    
    # Push tag
    git push origin "$version"
    
    echo -e "${GREEN}✅ Release $version created and pushed!${NC}"
    echo -e "${YELLOW}📝 Create a GitHub Release at: https://github.com/noebarneron/maths-com/releases/new${NC}"
}

# Show status
show_status() {
    echo -e "${BLUE}📊 Git Status${NC}"
    echo ""
    
    # Current branch
    local current_branch=$(get_current_branch)
    echo -e "${YELLOW}Current branch:${NC} $current_branch"
    
    # Working directory status
    if is_clean; then
        echo -e "${GREEN}Working directory:${NC} Clean ✅"
    else
        echo -e "${RED}Working directory:${NC} Dirty ❌"
        echo ""
        git status --short
    fi
    
    # Recent commits
    echo ""
    echo -e "${YELLOW}Recent commits:${NC}"
    git log --oneline -5
    
    # Branches
    echo ""
    echo -e "${YELLOW}All branches:${NC}"
    git branch -a
}

# Main command handler
case "$1" in
    start-feature)
        start_feature "$2"
        ;;
    start-hotfix)
        start_hotfix "$2"
        ;;
    finish-feature)
        finish_feature
        ;;
    finish-hotfix)
        finish_hotfix
        ;;
    release)
        create_release "$2"
        ;;
    sync)
        sync_branches
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
