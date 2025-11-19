/**
 * 模板解析工具
 * 支持变量替换和条件渲染
 * 
 * 变量格式：
 * - {variable} - 简单变量替换
 * - {variable:prefix} - 有值时添加前缀
 * - {variable::suffix} - 有值时添加后缀
 * - {variable:prefix:suffix} - 有值时添加前缀和后缀
 * 
 * 示例：
 * - {scope:(:)} - scope有值时显示为 (scope)，否则为空
 * - {contributors: (by :} - contributors有值时显示为 " (by @john & @jane)"，否则为空
 * - {issue: in :)} - issue有值时显示为 " in #123 #456)"，否则为空
 */

/**
 * 解析模板字符串
 * @param {string} template - 模板字符串
 * @param {object} data - 数据对象
 * @returns {string} - 解析后的字符串
 */
export function parseTemplate(template, data) {
    if (!template) {
        return '';
    }

    // 匹配 {variable} 或 {variable:prefix:suffix} 格式
    const regex = /\{(\w+)(?::([^:}]*?))?(?::([^}]*?))?\}/g;

    return template.replace(regex, (match, variable, prefix = '', suffix = '') => {
        const value = data[variable];

        // 如果值为空、undefined 或空字符串，返回空字符串
        if (value === null || value === undefined || value === '' ||
            (typeof value === 'string' && value.trim() === '')) {
            return '';
        }

        // 构建结果：prefix + value + suffix
        return `${prefix}${value}${suffix}`;
    });
}

/**
 * 格式化贡献者名称
 * @param {string} contributorsText - 贡献者文本
 * @returns {string} - 格式化后的贡献者文本
 */
export function formatContributors(contributorsText) {
    if (!contributorsText || !contributorsText.trim()) {
        return '';
    }

    // 如果已经包含 @，直接返回
    if (contributorsText.includes('@')) {
        return contributorsText.trim();
    }

    // 分割并格式化
    const names = contributorsText
        .split(/[\s,&]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0);

    return names.map(name => `@${name}`).join(' & ');
}

/**
 * 格式化 issue ID
 * @param {string} issueText - issue 文本，支持多个 ID 用逗号分隔
 * @returns {string} - 格式化后的 issue 文本
 */
export function formatIssue(issueText) {
    if (!issueText || !issueText.trim()) {
        return '';
    }

    // 如果已经包含 #，直接返回
    if (issueText.includes('#')) {
        return issueText.trim();
    }

    // 分割并格式化
    const issues = issueText
        .split(/[\s,]+/)
        .map(id => id.trim())
        .filter(id => id.length > 0);

    return issues.map(id => `#${id}`).join(' ');
}

/**
 * 获取默认模板
 * @returns {string} - 默认模板字符串
 */
export function getDefaultTemplate() {
    return '{icon} {type}{scope:(:)}: {message}{contributors: (by :}{issue: in :)}';
}

/**
 * 获取可用的模板变量列表
 * @returns {Array} - 变量列表
 */
export function getTemplateVariables() {
    return [
        {
            name: 'icon',
            label: '图标',
            description: 'commit 类型的 emoji 图标',
            example: '✨'
        },
        {
            name: 'type',
            label: '类型',
            description: 'commit 类型（如 feat, fix 等）',
            example: 'feat'
        },
        {
            name: 'scope',
            label: '范围',
            description: '改动影响的范围',
            example: 'ui'
        },
        {
            name: 'message',
            label: '消息',
            description: 'commit 的简短描述',
            example: 'add new button'
        },
        {
            name: 'contributors',
            label: '贡献者',
            description: '贡献者名称（逗号分隔，如 john,jane）',
            example: 'john,jane'
        },
        {
            name: 'issue',
            label: '问题 ID',
            description: '关联的 issue 编号（逗号分隔，如 123,456）',
            example: '123,456'
        }
    ];
}

/**
 * 获取模板示例
 * @returns {Array} - 示例列表
 */
export function getTemplateExamples() {
    return [
        {
            name: '默认格式',
            template: '{icon} {type}{scope:(:)}: {message}{contributors: (by :}{issue: in :)}',
            description: '默认格式'
        },
        {
            name: 'Angular 格式',
            template: '{type}{scope:(:)}: {message}',
            description: 'Angular 提交规范格式（无图标、无贡献者、无 issue）'
        }
    ];
}
