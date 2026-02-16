import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const API = 'https://api.github.com'
const DEFAULT_USER = 'obott9'

/* ─── 言語カラーマップ ─── */
const LANG_COLORS = {
  Swift: '#F05138', 'C#': '#178600', JavaScript: '#F7DF1E',
  TypeScript: '#3178C6', Python: '#3776AB', Java: '#B07219',
  Go: '#00ADD8', Rust: '#DEA584', C: '#555555', 'C++': '#F34B7D',
  HTML: '#E34C26', CSS: '#563D7C', Shell: '#89E051', Ruby: '#CC342D',
  Kotlin: '#A97BFF', Dart: '#00B4AB', PHP: '#4F5D95',
}

/* ─── ユーティリティ ─── */
const fmt = (n) => n.toLocaleString()
const fmtBytes = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`
const fmtDate = (s, lng) => {
  if (!s) return ''
  const locale = lng === 'ja' ? 'ja-JP' : 'en-US'
  return new Date(s).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}
const authHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {}

/* ─── ダウンロード数バー（視覚化） ─── */
function DownloadBar({ value, max }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div style={{ width: '100%', height: 4, background: '#21262d', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 2,
        background: value > 0 ? 'linear-gradient(90deg, #238636, #7ee787)' : 'transparent',
        transition: 'width 0.6s ease-out',
      }} />
    </div>
  )
}

/* ─── アセット行 ─── */
function AssetRow({ asset }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0 6px 24px', fontSize: 13,
    }}>
      <span style={{ color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#8b949e">
          <path d="M3.5 1.75a.25.25 0 01.25-.25h3a.75.75 0 000 1.5H4.5V6h2.25a.75.75 0 000-1.5H5.5v-.75h1.25a.75.75 0 000-1.5h-3a.25.25 0 01-.25-.25v-1z" />
          <path fillRule="evenodd" d="M1 1.75C1 .784 1.784 0 2.75 0h7.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-10.5A1.75 1.75 0 011 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V4.664a.25.25 0 00-.073-.177l-2.914-2.914a.25.25 0 00-.177-.073H2.75z" />
        </svg>
        {asset.name}
        <span style={{ fontSize: 11, color: '#484f58' }}>({fmtBytes(asset.size)})</span>
      </span>
      <span style={{
        fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums',
        color: asset.downloads > 0 ? '#7ee787' : '#484f58',
      }}>
        {fmt(asset.downloads)}
      </span>
    </div>
  )
}

/* ─── リリースカード ─── */
function ReleaseCard({ release, isLast, t, lng }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: isLast ? 'none' : '1px solid #21262d' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#d2a8ff">
            <path fillRule="evenodd" d="M2.5 7.775V2.75a.25.25 0 01.25-.25h5.025a.25.25 0 01.177.073l6.25 6.25a.25.25 0 010 .354l-5.025 5.025a.25.25 0 01-.354 0l-6.25-6.25a.25.25 0 01-.073-.177zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .909.184 1.237.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.025 5.025a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zM6 5a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{release.tagName}</span>
          {release.name !== release.tagName && (
            <span style={{ fontSize: 13, color: '#8b949e' }}>{release.name}</span>
          )}
          {release.prerelease && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
              background: 'rgba(210,168,255,0.12)', color: '#d2a8ff', letterSpacing: '0.02em',
            }}>PRE-RELEASE</span>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#484f58', whiteSpace: 'nowrap' }}>
          {fmtDate(release.publishedAt, lng)}
        </span>
      </div>
      {release.assets.length > 0
        ? release.assets.map((a, i) => <AssetRow key={i} asset={a} />)
        : <div style={{ paddingLeft: 24, fontSize: 12, color: '#484f58', fontStyle: 'italic' }}>{t('repo.sourceOnly')}</div>
      }
    </div>
  )
}

/* ─── Traffic バッジ（クローン/ビュー） ─── */
function TrafficBadge({ icon, count, uniques, color }) {
  if (count == null) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#8b949e',
    }}>
      <span style={{ color, fontSize: 13 }}>{icon}</span>
      <span style={{ color }}>{fmt(count)}</span>
      <span style={{ color: '#484f58', fontSize: 11 }}>({fmt(uniques)} uniq)</span>
    </div>
  )
}

/* ─── リポジトリ行 ─── */
function RepoRow({ repo, maxDL, expanded, onToggle, hasToken, t, lng }) {
  const hasReleases = repo.releaseCount > 0

  return (
    <div style={{
      background: '#161b22', borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${expanded ? '#30578a' : '#21262d'}`,
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: expanded ? '0 0 0 1px rgba(88,166,255,0.15)' : 'none',
    }}>
      <div
        onClick={() => hasReleases && onToggle(repo.name)}
        style={{
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          cursor: hasReleases ? 'pointer' : 'default',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => hasReleases && (e.currentTarget.style.background = '#1c2129')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {/* 左: リポジトリ情報 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <a
              href={repo.url} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: '#58a6ff', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}
              onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
            >
              {repo.name}
            </a>
            {repo.language && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8b949e' }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', display: 'inline-block',
                  background: LANG_COLORS[repo.language] || '#8b949e',
                }} />
                {repo.language}
              </span>
            )}
            <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="#8b949e">
                <path fillRule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
              </svg>
              {repo.stars}
            </span>
            {repo.releaseCount > 0 && (
              <span style={{
                fontSize: 11, padding: '1px 8px', borderRadius: 12,
                background: 'rgba(88,166,255,0.1)', color: '#58a6ff',
              }}>
                {repo.releaseCount} {repo.releaseCount > 1 ? t('repo.releases') : t('repo.release')}
              </span>
            )}
          </div>
          {repo.description && (
            <p style={{ fontSize: 13, color: '#8b949e', margin: '5px 0 0', lineHeight: 1.4 }}>{repo.description}</p>
          )}
          {/* Traffic バッジ（トークン認証時のみ） */}
          {hasToken && (repo.clones != null || repo.views != null) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <TrafficBadge icon="&#128230;" count={repo.clones} uniques={repo.clonesUniques} color="#79c0ff" />
              <TrafficBadge icon="&#128065;" count={repo.views} uniques={repo.viewsUniques} color="#d2a8ff" />
            </div>
          )}
          {/* ダウンロードバー */}
          <div style={{ marginTop: 8 }}>
            <DownloadBar value={repo.totalDownloads} max={maxDL} />
          </div>
        </div>

        {/* 右: ダウンロード数 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
              color: repo.totalDownloads > 0 ? '#7ee787' : '#484f58',
              lineHeight: 1,
            }}>
              {fmt(repo.totalDownloads)}
            </div>
            <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>{t('repo.downloads')}</div>
          </div>
          {hasReleases && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#484f58"
              style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path fillRule="evenodd" d="M12.78 6.22a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0L3.22 7.28a.75.75 0 011.06-1.06L8 9.94l3.72-3.72a.75.75 0 011.06 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* リリース詳細 */}
      {expanded && repo.releases.length > 0 && (
        <div style={{ borderTop: '1px solid #21262d', padding: '4px 16px 8px', background: 'rgba(13,17,23,0.6)' }}>
          {repo.releases.map((rel, i) => (
            <ReleaseCard key={i} release={rel} isLast={i === repo.releases.length - 1} t={t} lng={lng} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── メインアプリ ─── */
const UI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
]

export default function App() {
  const { t, i18n } = useTranslation()
  const [username, setUsername] = useState(DEFAULT_USER)
  const [input, setInput] = useState(DEFAULT_USER)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rateLimit, setRateLimit] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [fadeIn, setFadeIn] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem('gh_token') || '')
  const [showToken, setShowToken] = useState(false)
  const tokenRef = useRef(token)

  const saveToken = (val) => {
    setToken(val)
    tokenRef.current = val
    if (val) localStorage.setItem('gh_token', val)
    else localStorage.removeItem('gh_token')
  }

  const fetchData = useCallback(async (user) => {
    setLoading(true)
    setError(null)
    setRepos([])
    setExpanded(null)
    setFadeIn(false)

    const currentToken = tokenRef.current
    const headers = authHeaders(currentToken)

    try {
      const repoRes = await fetch(`${API}/users/${user}/repos?per_page=100&sort=updated`, { headers })
      if (!repoRes.ok) {
        if (repoRes.status === 404) throw new Error(t('error.userNotFound', { user }))
        if (repoRes.status === 403) throw new Error(t('error.rateLimit'))
        throw new Error(t('error.apiError', { status: repoRes.status }))
      }

      setRateLimit({
        remaining: repoRes.headers.get('x-ratelimit-remaining'),
        limit: repoRes.headers.get('x-ratelimit-limit'),
        reset: new Date(repoRes.headers.get('x-ratelimit-reset') * 1000),
      })

      const repoData = await repoRes.json()

      const results = await Promise.all(
        repoData.map(async (repo) => {
          try {
            const [relRes, ...trafficResults] = await Promise.all([
              fetch(`${API}/repos/${user}/${repo.name}/releases?per_page=100`, { headers }),
              ...(currentToken ? [
                fetch(`${API}/repos/${user}/${repo.name}/traffic/clones`, { headers }).catch(() => null),
                fetch(`${API}/repos/${user}/${repo.name}/traffic/views`, { headers }).catch(() => null),
              ] : []),
            ])

            const releases = relRes.ok ? await relRes.json() : []

            // Traffic data（トークン認証 + push権限がある場合のみ取得可能）
            let clones = null, clonesUniques = null, views = null, viewsUniques = null
            if (currentToken && trafficResults.length === 2) {
              const [clonesRes, viewsRes] = trafficResults
              if (clonesRes?.ok) {
                const d = await clonesRes.json()
                clones = d.count
                clonesUniques = d.uniques
              }
              if (viewsRes?.ok) {
                const d = await viewsRes.json()
                views = d.count
                viewsUniques = d.uniques
              }
            }

            let totalDownloads = 0
            const releaseDetails = releases.map((rel) => {
              const assets = rel.assets.map((a) => ({
                name: a.name, downloads: a.download_count, size: a.size, createdAt: a.created_at,
              }))
              const dlCount = assets.reduce((s, a) => s + a.downloads, 0)
              totalDownloads += dlCount
              return {
                tagName: rel.tag_name, name: rel.name || rel.tag_name,
                publishedAt: rel.published_at, prerelease: rel.prerelease,
                downloads: dlCount, assets,
              }
            })

            return {
              name: repo.name, description: repo.description,
              stars: repo.stargazers_count, forks: repo.forks_count,
              language: repo.language, url: repo.html_url,
              totalDownloads, releaseCount: releases.length, releases: releaseDetails,
              clones, clonesUniques, views, viewsUniques,
            }
          } catch {
            return {
              name: repo.name, description: repo.description,
              stars: repo.stargazers_count, forks: repo.forks_count,
              language: repo.language, url: repo.html_url,
              totalDownloads: 0, releaseCount: 0, releases: [],
              clones: null, clonesUniques: null, views: null, viewsUniques: null,
            }
          }
        })
      )

      results.sort((a, b) => (a.totalDownloads === 0 && b.totalDownloads === 0)
        ? b.stars - a.stars : b.totalDownloads - a.totalDownloads)
      setRepos(results)
      setTimeout(() => setFadeIn(true), 50)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchData(username) }, [username, fetchData])

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (input.trim()) setUsername(input.trim())
  }

  const toggleExpand = (name) => setExpanded(expanded === name ? null : name)

  const totalDL = repos.reduce((s, r) => s + r.totalDownloads, 0)
  const totalReleases = repos.reduce((s, r) => s + r.releaseCount, 0)
  const withDL = repos.filter((r) => r.totalDownloads > 0).length
  const maxDL = repos.length > 0 ? Math.max(...repos.map((r) => r.totalDownloads)) : 0
  const hasTraffic = repos.some((r) => r.clones != null || r.views != null)
  const totalClones = repos.reduce((s, r) => s + (r.clones || 0), 0)
  const totalViews = repos.reduce((s, r) => s + (r.views || 0), 0)

  return (
    <div style={{
      minHeight: '100vh', color: '#e6edf3',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      background: '#0d1117',
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: #0d1117; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        input::placeholder { color: #484f58; }
        input:focus { border-color: #58a6ff !important; box-shadow: 0 0 0 3px rgba(88,166,255,0.15) !important; }
      `}</style>

      {/* ヘッダーバー */}
      <div style={{ borderBottom: '1px solid #21262d', background: '#161b22', padding: '12px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg height="28" viewBox="0 0 16 16" width="28" fill="#e6edf3">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span style={{ fontSize: 18, fontWeight: 600 }}>{t('header.title')}</span>
          <span style={{ fontSize: 13, color: '#8b949e', marginLeft: 4 }}>{t('header.subtitle')}</span>
          <div style={{ marginLeft: 'auto' }}>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid #30363d',
                background: '#0d1117', color: '#e6edf3', fontSize: 13, outline: 'none',
                cursor: 'pointer',
              }}
            >
              {UI_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* 検索バー */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={t('search.placeholder')}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8,
              border: '1px solid #30363d', background: '#0d1117',
              color: '#e6edf3', fontSize: 15, outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          />
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(240,246,252,0.1)',
            background: loading ? '#21262d' : '#238636', color: '#fff',
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}>
            {loading ? '...' : t('search.fetch')}
          </button>
        </div>

        {/* トークン入力（折りたたみ式） */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowToken(!showToken)}
            style={{
              background: 'none', border: 'none', color: '#8b949e', fontSize: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 0',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="#8b949e"
              style={{ transition: 'transform 0.2s', transform: showToken ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
            </svg>
            {t('token.toggle')}
            {token && <span style={{ color: '#238636', marginLeft: 4 }}>&#10003;</span>}
          </button>
          {showToken && (
            <div style={{
              marginTop: 8, padding: '12px 14px', borderRadius: 8,
              background: '#161b22', border: '1px solid #21262d',
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="password" value={token}
                  onChange={(e) => saveToken(e.target.value)}
                  placeholder={t('token.placeholder')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 6,
                    border: '1px solid #30363d', background: '#0d1117',
                    color: '#e6edf3', fontSize: 13, outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                />
                {token && (
                  <button onClick={() => saveToken('')} style={{
                    padding: '8px 12px', borderRadius: 6, border: '1px solid #30363d',
                    background: 'transparent', color: '#f85149', fontSize: 12,
                    cursor: 'pointer',
                  }}>
                    {t('token.clear')}
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11, color: '#484f58', marginTop: 6, lineHeight: 1.5 }}>
                {t('token.description')}
              </p>
            </div>
          )}
        </div>

        {/* エラー */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14,
            background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.3)', color: '#f85149',
          }}>{error}</div>
        )}

        {/* ローディング */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#8b949e' }}>
            <div style={{
              width: 36, height: 36, border: '3px solid #21262d', borderTopColor: '#58a6ff',
              borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
              {t('search.loading', { username })}
            </p>
          </div>
        )}

        {/* 結果 */}
        {!loading && repos.length > 0 && (
          <div style={{
            opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.4s, transform 0.4s',
          }}>
            {/* サマリー */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10, marginBottom: 28,
            }}>
              {[
                { label: t('summary.totalDownloads'), value: fmt(totalDL), color: '#58a6ff' },
                { label: t('summary.repositories'), value: repos.length, color: '#7ee787' },
                { label: t('summary.releases'), value: totalReleases, color: '#d2a8ff' },
                { label: t('summary.withDownloads'), value: withDL, color: '#f0883e' },
                ...(hasTraffic ? [
                  { label: t('summary.clones14d'), value: fmt(totalClones), color: '#79c0ff' },
                  { label: t('summary.views14d'), value: fmt(totalViews), color: '#d2a8ff' },
                ] : []),
              ].map((s) => (
                <div key={s.label} style={{
                  background: '#161b22', border: '1px solid #21262d', borderRadius: 10,
                  padding: '16px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* リポジトリ一覧 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {repos.map((repo, i) => (
                <div key={repo.name} style={{ animation: `fadeUp 0.3s ease-out ${i * 0.03}s both` }}>
                  <RepoRow repo={repo} maxDL={maxDL} expanded={expanded === repo.name} onToggle={toggleExpand} hasToken={!!token} t={t} lng={i18n.language} />
                </div>
              ))}
            </div>

            {/* フッター情報 */}
            <div style={{
              marginTop: 28, padding: '14px 16px', borderRadius: 8,
              background: '#161b22', border: '1px solid #21262d',
              fontSize: 12, color: '#484f58', lineHeight: 1.9,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ color: '#8b949e' }}>API:</span> GitHub REST v3
                  &nbsp;|&nbsp;
                  <span style={{ color: '#8b949e' }}>{t('footer.endpoints')}:</span>{' '}
                  <code style={{ background: '#21262d', padding: '1px 5px', borderRadius: 3 }}>/users/:user/repos</code>{' '}
                  <code style={{ background: '#21262d', padding: '1px 5px', borderRadius: 3 }}>/repos/:owner/:repo/releases</code>
                  {token && (
                    <>
                      {' '}
                      <code style={{ background: '#21262d', padding: '1px 5px', borderRadius: 3 }}>/traffic/clones</code>{' '}
                      <code style={{ background: '#21262d', padding: '1px 5px', borderRadius: 3 }}>/traffic/views</code>
                    </>
                  )}
                </div>
                {rateLimit && (
                  <div>
                    Rate Limit: <span style={{ color: parseInt(rateLimit.remaining) < 10 ? '#f85149' : '#8b949e' }}>
                      {rateLimit.remaining}/{rateLimit.limit}
                    </span>
                    &nbsp;(reset {rateLimit.reset.toLocaleTimeString(i18n.language === 'ja' ? 'ja-JP' : 'en-US')})
                  </div>
                )}
              </div>
              <div style={{ marginTop: 6 }}>
                {t('footer.stack')}
              </div>
              <div style={{ marginTop: 4, color: '#30363d' }}>
                {t('footer.copyright')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
