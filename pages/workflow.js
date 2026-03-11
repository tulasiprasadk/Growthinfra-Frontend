import { useEffect, useMemo, useRef, useState } from 'react';
import { authFetch } from '../utils/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const RELIABLE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=800&fit=crop',
];

export default function WorkflowPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultText, setResultText] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoStatus, setVideoStatus] = useState('');
  const [videoPlan, setVideoPlan] = useState(null);
  const [animatedVideoUrl, setAnimatedVideoUrl] = useState('');
  const [isAnimatingVideo, setIsAnimatingVideo] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState('image');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const animatedUrlRef = useRef('');

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('all');
  const [organizations, setOrganizations] = useState([]);
  const [targetOrganizationId, setTargetOrganizationId] = useState('');
  const [manualAccounts, setManualAccounts] = useState([]);
  const [customLabels, setCustomLabels] = useState({});
  const [manualLabel, setManualLabel] = useState('');
  const [manualPlatform, setManualPlatform] = useState('facebook');
  const [manualProvider, setManualProvider] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [editingAccountId, setEditingAccountId] = useState('');
  const [editingCustomLabel, setEditingCustomLabel] = useState('');

  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduledItems, setScheduledItems] = useState([]);
  const [planDays, setPlanDays] = useState(7);
  const [useSchedule, setUseSchedule] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState('');
  const [activeCustomerId, setActiveCustomerId] = useState('');
  const [customersHydrated, setCustomersHydrated] = useState(false);
  const [accountsHydrated, setAccountsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('sma_customers');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomers(parsed);
          setActiveCustomerId(parsed[0]?.id || '');
        }
      } catch {
        setCustomers([]);
      }
    }
    setCustomersHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('sma_manual_accounts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setManualAccounts(parsed);
      } catch {
        setManualAccounts([]);
      }
    }

    const storedLabels = localStorage.getItem('sma_custom_labels');
    if (storedLabels) {
      try {
        const parsed = JSON.parse(storedLabels);
        setCustomLabels(parsed);
      } catch {
        setCustomLabels({});
      }
    }
    setAccountsHydrated(true);
  }, []);

  useEffect(() => {
    if (!accountsHydrated || typeof window === 'undefined') return;
    localStorage.setItem('sma_custom_labels', JSON.stringify(customLabels));
  }, [customLabels, accountsHydrated]);

  useEffect(() => {
    if (!customersHydrated || typeof window === 'undefined') return;
    localStorage.setItem('sma_customers', JSON.stringify(customers));
  }, [customers, customersHydrated]);

  useEffect(() => {
    if (!accountsHydrated || typeof window === 'undefined') return;
    localStorage.setItem('sma_manual_accounts', JSON.stringify(manualAccounts));
  }, [manualAccounts, accountsHydrated]);

  const activeCustomer = useMemo(
    () => customers.find((c) => c.id === activeCustomerId) || null,
    [customers, activeCustomerId],
  );

  const loadAccounts = async () => {
    try {
      const res = await authFetch('/api/social/pages');
      const json = await res.json();
      const list = Array.isArray(json) ? json : [];
      // Apply custom labels
      const withCustomLabels = list.map(acc => ({
        ...acc,
        label: customLabels[acc.id] || acc.label
      }));
      const merged = [...withCustomLabels, ...manualAccounts];
      setAccounts(merged);
      if (selectedAccountIds.length === 0 && merged.length > 0) {
        setSelectedAccountIds([merged[0].id]);
      }
    } catch (err) {
      const merged = [...manualAccounts];
      setAccounts(merged);
      if (selectedAccountIds.length === 0 && merged.length > 0) {
        setSelectedAccountIds([merged[0].id]);
      }
    }
  };

  const loadOrganizations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/org`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : [];
      setOrganizations(list);
      if (!targetOrganizationId && list.length > 0) {
        setTargetOrganizationId(list[0].id);
      }
    } catch {
      setOrganizations([]);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [manualAccounts, customLabels]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const toggleAccountSelection = (accountId) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  const handleAssignSelectedToOrganization = async () => {
    if (!targetOrganizationId) {
      setError('Select an organization first.');
      return;
    }
    const selectedIds = selectedAccountIds.filter((id) => accounts.some((a) => a.id === id));
    if (selectedIds.length === 0) {
      setError('Select at least one account to assign.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const results = await Promise.all(
        selectedIds.map((id) =>
          authFetch(`/api/social/pages/${id}/organization`, {
            method: 'PATCH',
            body: JSON.stringify({ organizationId: targetOrganizationId }),
          }).then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data?.error || `HTTP ${res.status}`);
            }
            return true;
          }),
        ),
      );
      if (results.length) {
        await loadAccounts();
        alert(`Assigned ${results.length} account(s) to selected organization.`);
      }
    } catch (e) {
      setError(`Failed to assign accounts: ${String(e?.message || e)}`);
    } finally {
      setLoading(false);
    }
  };

  const isAccountPostable = (acc) => acc?.isPostable !== false;

  const organizationOptions = useMemo(() => {
    const names = new Set();
    for (const acc of accounts) {
      const org = acc?.organizationName || 'Unassigned';
      names.add(org);
    }
    return ['all', ...Array.from(names)];
  }, [accounts]);

  const visibleAccounts = useMemo(() => {
    if (selectedOrgFilter === 'all') return accounts;
    return accounts.filter((acc) => (acc?.organizationName || 'Unassigned') === selectedOrgFilter);
  }, [accounts, selectedOrgFilter]);

  const organizationGroups = useMemo(() => {
    const groups = {};
    for (const acc of visibleAccounts) {
      const org = acc?.organizationName || 'Unassigned';
      if (!groups[org]) groups[org] = [];
      groups[org].push(acc);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [visibleAccounts]);

  const resolvePageId = (acc) => {
    if (acc?.pageId) return String(acc.pageId);
    const provider = String(acc?.provider || '');
    if (acc?.platform === 'facebook' && provider.startsWith('facebook:')) {
      return provider.slice('facebook:'.length);
    }
    return provider;
  };

  const getSelectedMedia = () => {
    if (selectedMediaType === 'animatedVideo' && animatedVideoUrl) {
      return { type: 'animatedVideo', url: animatedVideoUrl };
    }
    if (selectedMediaType === 'externalVideo' && selectedVideo) {
      return { type: 'externalVideo', url: selectedVideo };
    }
    return { type: 'image', url: selectedImage };
  };

  const cleanupAnimatedUrl = () => {
    if (animatedUrlRef.current) {
      URL.revokeObjectURL(animatedUrlRef.current);
      animatedUrlRef.current = '';
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const createAnimatedReel = async () => {
    if (!videos.length) {
      setError('No free reel available yet. Click Generate first to fetch free video reels.');
      return;
    }

    setIsAnimatingVideo(true);
    setError('');
    try {
      const nonEmbed = videos.find((v) => typeof v === 'string' && !v.includes('youtube.com/embed/'));
      const candidate = nonEmbed || videos[0] || '';
      if (!candidate) {
        throw new Error('No usable free reel URL returned');
      }

      // Prefer direct MP4/webm clips for playback/download.
      if (!candidate.includes('youtube.com/embed/')) {
        cleanupAnimatedUrl();
        setAnimatedVideoUrl(candidate);
        setSelectedVideo(candidate);
        setVideoStatus('free_reel_selected');
        setSelectedMediaType('animatedVideo');
      } else {
        setSelectedVideo(candidate);
        setVideoStatus('free_reel_embed_selected');
        setSelectedMediaType('externalVideo');
        setError('Using free YouTube reel (embed). For downloadable reels, use topics that return direct MP4 clips.');
      }
    } catch (e) {
      const msg = String(e?.message || e || '');
      setError(`Free reel selection failed: ${msg}`);
    } finally {
      setIsAnimatingVideo(false);
    }
  };

  useEffect(() => {
    return () => cleanupAnimatedUrl();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const ctx = activeCustomer || {};
      const res = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: topic.trim(),
          context: {
            brandName: ctx.name,
            tagline: ctx.tagline,
            website: ctx.website,
            email: ctx.email,
            contact: ctx.contact,
            description: ctx.description,
            imagePrompt: ctx.imagePrompt,
            launchContext: ctx.launchContext,
            audience: ctx.audience,
          },
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      const insights = Array.isArray(data?.insights) ? data.insights : [];
      let insightText = '';
      if (insights[0]) {
        try {
          const parsed = typeof insights[0] === 'string' ? JSON.parse(insights[0]) : insights[0];
          insightText = parsed?.text || '';
        } catch {
          insightText = typeof insights[0] === 'string' ? insights[0] : '';
        }
      }
      const text = insightText || data?.result || '';
      const imageList = Array.isArray(data?.images) ? data.images : [];
      const videoList = Array.isArray(data?.reels) ? data.reels : [];
      const vStatus = data?.videoStatus || '';
      const plan = data?.videoPlan || null;
      const tags = data?.hashtags || '';
      const makeFallbackImages = () => {
        const nonce = Date.now();
        return RELIABLE_FALLBACK_IMAGES.map((url, idx) => `${url}&sig=${nonce + idx}`);
      };
      setResultText(String(text || ''));
      setHashtags(String(tags || ''));
      const fallback = makeFallbackImages(topic);
      setImages(imageList.length ? imageList : fallback);
      setVideos(videoList);
      setVideoStatus(String(vStatus || ''));
      setVideoPlan(plan);
      cleanupAnimatedUrl();
      setAnimatedVideoUrl('');
      setSelectedVideo(videoList[0] || '');
      setSelectedMediaType('image');
      setSelectedImage((imageList[0] || fallback[0] || ''));
      if (!imageList.length) {
        setError('No images returned from the server. Showing fallback images instead.');
      }
    } catch (err) {
      const makeFallbackImages = () => {
        const nonce = Date.now();
        return RELIABLE_FALLBACK_IMAGES.map((url, idx) => `${url}&sig=${nonce + idx}`);
      };
      const fb = makeFallbackImages(topic);
      setImages(fb);
      setSelectedImage(fb[0] || '');
      setVideos([]);
      setSelectedVideo('');
      setSelectedMediaType('image');
      setVideoStatus('search_request_failed');
      cleanupAnimatedUrl();
      setAnimatedVideoUrl('');
      setError(`Failed to generate content. Showing fallback images. ${String(err?.message || err || '')}`.trim());
    } finally {
      setLoading(false);
    }
  };

  const uploadImageDataUrl = async (dataUrl) => {
    const res = await fetch(`${API_BASE}/api/social/upload-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(errText || `Upload failed with status ${res.status}`);
    }
    const data = await res.json();
    return data?.url || '';
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select date and time');
      return;
    }
    if (selectedAccountIds.length === 0) {
      alert('Please select at least one account');
      return;
    }
    const selectedMedia = getSelectedMedia();
    if (selectedMedia.type === 'image' && !selectedImage) {
      alert('Please select an image before scheduling');
      return;
    }
    
    const ctx = activeCustomer || {};
    const footerParts = [
      ctx.tagline,
      ctx.website,
      ctx.email,
      ctx.contact,
    ].filter(Boolean);
    const footer = footerParts.length ? `\n\n${footerParts.join(' | ')}` : '';
    const hashtagLine = hashtags ? `\n\n${hashtags}` : '';
    const fullText = `${resultText || topic}${footer}${hashtagLine}`;
    
    const selectedAccounts = accounts.filter((acc) => selectedAccountIds.includes(acc.id) && isAccountPostable(acc));
    const scheduledTime = `${scheduleDate}T${scheduleTime}:00`;

    setLoading(true);
    
    const mediaImageUrl = selectedMedia.type === 'image' ? selectedMedia.url : selectedImage;
    if (selectedMedia.type !== 'image') {
      alert('Video scheduling is not enabled in publisher yet. We will schedule this as image + caption for now.');
    }

    fetch(`${API_BASE}/api/social/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduledTime,
        message: fullText,
        imageUrl: mediaImageUrl,
        mediaType: selectedMedia.type,
        mediaUrl: selectedMedia.url,
        accounts: selectedAccounts.map((acc) => ({
          platform: acc.platform,
          pageId: resolvePageId(acc),
          accessToken: acc.accessToken,
        })),
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        return data;
      })
      .then((data) => {
        setLoading(false);
        alert(`Post scheduled for ${scheduleDate} at ${scheduleTime}`);
        loadScheduledPosts();
      })
      .catch((err) => {
        setLoading(false);
        alert(`Failed to schedule: ${err.message}`);
      });
  };

  const loadScheduledPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/social/schedule/all`);
      const data = await res.json();
      setScheduledItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load scheduled posts:', err);
    }
  };

  const handleDeleteScheduled = async (id) => {
    if (!confirm('Delete this scheduled post?')) return;
    try {
      await fetch(`${API_BASE}/api/social/schedule/${id}`, { method: 'DELETE' });
      loadScheduledPosts();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  useEffect(() => {
    loadScheduledPosts();
    const interval = setInterval(loadScheduledPosts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const buildPlan = (days) => {
    const start = new Date();
    const items = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const date = d.toISOString().slice(0, 10);
      const type = i % 3 === 0 ? 'Text' : i % 3 === 1 ? 'Image' : 'Video';
      items.push({ id: `plan_${date}`, date, type });
    }
    return items;
  };

  const planItems = buildPlan(planDays);
  const planWeeks = planItems.reduce((acc, item, idx) => {
    const weekIndex = Math.floor(idx / 7);
    if (!acc[weekIndex]) acc[weekIndex] = [];
    acc[weekIndex].push(item);
    return acc;
  }, []);

  const handlePostNow = async () => {
    if (selectedAccountIds.length === 0) {
      setError('Please select at least one account.');
      return;
    }
    
    const ctx = activeCustomer || {};
    
    // Debug: Log customer data
    console.log('Active Customer:', ctx);
    
    if (!ctx.tagline && !ctx.website && !ctx.email && !ctx.contact) {
      alert('Customer details missing. Please fill in Punch line, Website, Email, and Contact in Step 1.');
      return;
    }
    
    const footerParts = [
      ctx.tagline,
      ctx.website,
      ctx.email,
      ctx.contact,
    ].filter(Boolean);
    const footer = footerParts.length ? `\n\n${footerParts.join(' | ')}` : '';
    const hashtagLine = hashtags ? `\n\n${hashtags}` : '';
    
    console.log('Footer to be added:', footer);
    console.log('Hashtags to be added:', hashtagLine);
    console.log('Full message:', `${resultText || topic}${footer}${hashtagLine}`);
    
    setLoading(true);
    setError('');
    
    const selectedAccounts = accounts.filter((acc) => selectedAccountIds.includes(acc.id) && isAccountPostable(acc));
    
    if (selectedAccounts.length === 0) {
      setError('No valid accounts selected.');
      setLoading(false);
      return;
    }
    
    const selectedMedia = getSelectedMedia();

    // Check if any account requires an image
    const requiresImage = selectedAccounts.some((acc) => acc.platform === 'instagram' || acc.platform === 'facebook');
    if (requiresImage && !selectedImage) {
      const accountsRequiringImage = selectedAccounts.filter((acc) => acc.platform === 'instagram' || acc.platform === 'facebook').map((acc) => acc.platform).join(', ');
      setError(`${accountsRequiringImage.charAt(0).toUpperCase() + accountsRequiringImage.slice(1)} require an image. Please select or generate an image first.`);
      setLoading(false);
      return;
    }

    // If scheduling, validate date and time
    if (useSchedule) {
      if (!scheduleDate || !scheduleTime) {
        setError('Please select a date and time to schedule the post.');
        setLoading(false);
        return;
      }
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime <= new Date()) {
        setError('Scheduled time must be in the future.');
        setLoading(false);
        return;
      }
    }
    
    console.log('Selected accounts:', selectedAccounts);
    console.log('Selected image:', selectedImage);
    
    const message = `${resultText || topic}${footer}${hashtagLine}`;
    
    try {
      let imageToPost = selectedImage || undefined;
      if (selectedMedia.type !== 'image') {
        setError('Video posting is not enabled yet in publisher APIs. Posting with selected image + caption.');
      }
      const isSocialMedia = selectedAccounts.some((acc) => ['facebook', 'instagram'].includes(acc.platform));

      // For social media, skip logo overlay and use original image directly
      if (isSocialMedia) {
        console.log('Using original image URL for social media posting');
        imageToPost = selectedImage;
      } else if (imageToPost && ctx.logoUrl) {
        console.log('Overlaying logo on image...');
        imageToPost = await overlayLogoOnImage(imageToPost, ctx.logoUrl);
      }

      const accountsPayload = selectedAccounts.map((acc) => ({
        platform: acc.platform,
        pageId: resolvePageId(acc),
        accessToken: acc.accessToken,
      }));

      if (useSchedule) {
        // Schedule the post
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        const schedulePayload = {
          message,
          imageUrl: imageToPost,
          mediaType: selectedMedia.type,
          mediaUrl: selectedMedia.url,
          accounts: accountsPayload,
          scheduledTime: scheduledDateTime.toISOString(),
        };

        console.log('Scheduling post for:', scheduledDateTime.toLocaleString());
        const res = await fetch(`${API_BASE}/api/social/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schedulePayload),
        });

        setLoading(false);

        if (res.ok) {
          const responseData = await res.json();
          console.log('Scheduled post response:', responseData);
          setError('');
          alert(`Post scheduled for ${scheduledDateTime.toLocaleString()}!`);
          setScheduleDate('');
          setScheduleTime('');
          setUseSchedule(false);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to schedule:', errorData);
          setError(`Failed to schedule post: ${errorData.error || `HTTP ${res.status}`}`);
          alert(`Failed to schedule: ${errorData.error || 'Unknown error'}`);
        }
      } else {
        // Post immediately to all accounts
        const results = [];

        for (const account of selectedAccounts) {
          const platform = account.platform;
          const pageId = resolvePageId(account);
          
          console.log(`Attempting to post to ${account.label || pageId} (${platform})...`);
          
          if (!account.accessToken) {
            results.push({ account: account.label || account.provider, status: 'failed', reason: 'No access token. Add token or connect via OAuth.' });
            console.error(`Account ${account.label || pageId} has no access token`);
            continue;
          }
          
          try {
            const payload = {
              pageId,
              message,
              imageUrl: imageToPost,
              accessToken: account.accessToken,
            };
            
            console.log('Sending payload:', { ...payload, accessToken: '***hidden***' });
            
            let res = await fetch(`${API_BASE}/api/social/publish/${platform}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.status === 503) {
              console.warn(`503 from ${platform}; retrying once after delay...`);
              await sleep(1500);
              res = await fetch(`${API_BASE}/api/social/publish/${platform}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
            }
            
            if (res.ok) {
              const responseData = await res.json();
              console.log('Success response:', responseData);
              results.push({ account: account.label || account.provider, status: 'success' });
            } else {
              const errorData = await res.json().catch(() => ({}));
              console.error('Failed response:', errorData);
              results.push({ account: account.label || account.provider, status: 'failed', reason: errorData.error || `HTTP ${res.status}` });
            }
          } catch (err) {
            console.error('Exception during post:', err);
            results.push({ account: account.label || account.provider, status: 'failed', reason: String(err) });
          }
        }
        
        const successCount = results.filter((r) => r.status === 'success').length;
        const failedCount = results.filter((r) => r.status === 'failed').length;
        
        console.log('Results:', results);
        
        if (failedCount === 0) {
          setError('');
          alert(`Posted successfully to ${successCount} account(s)!`);
        } else {
          const failedDetails = results.filter((r) => r.status === 'failed').map((r) => `${r.account}: ${r.reason}`).join('\n');
          setError(`Posted to ${successCount}, but failed for:\n${failedDetails}`);
          alert(`Partial success:\n${successCount} succeeded\n${failedCount} failed\n\nErrors:\n${failedDetails}`);
        }
      }
    } catch (err) {
      setLoading(false);
      console.error('Error in post/schedule:', err);
      setError(`Error: ${String(err)}`);
    }
  };

  const handleAddCustomer = () => {
    const name = newCustomer.trim();
    if (!name) return;
    const created = {
      id: `cust_${Date.now()}`,
      name,
      logoUrl: '',
      tagline: '',
      contact: '',
      email: '',
      website: '',
      description: '',
      imagePrompt: '',
      launchContext: 'Launched one week ago',
      audience: '',
    };
    setCustomers((prev) => [...prev, created]);
    setActiveCustomerId(created.id);
    setNewCustomer('');
  };

  const handleAddManualAccount = () => {
    if (!manualProvider.trim()) return;
    const created = {
      id: `manual_${Date.now()}`,
      label: manualLabel || manualProvider.trim(),
      provider: manualProvider.trim(),
      platform: manualPlatform,
      accessToken: manualToken.trim() || undefined,
    };
    setManualAccounts((prev) => [...prev, created]);
    setManualLabel('');
    setManualProvider('');
    setManualToken('');
    setEditingAccountId('');
  };

  const handleEditAccount = (account) => {
    setManualLabel(account.label || '');
    setManualPlatform(account.platform || 'facebook');
    setManualProvider(account.provider || '');
    setManualToken('');
    setEditingAccountId(account.id);
    setEditingCustomLabel(account.label || '');
  };

  const handleSaveCustomLabel = (accountId, newLabel) => {
    setCustomLabels(prev => ({
      ...prev,
      [accountId]: newLabel
    }));
    setEditingAccountId('');
    setEditingCustomLabel('');
  };

  const handleSaveManualAccount = () => {
    if (!editingAccountId) return;
    if (!manualProvider.trim()) return;
    setManualAccounts((prev) =>
      prev.map((acc) =>
        acc.id === editingAccountId
          ? {
              ...acc,
              label: manualLabel || manualProvider.trim(),
              provider: manualProvider.trim(),
              platform: manualPlatform,
              accessToken: manualToken.trim() || acc.accessToken,
            }
          : acc,
      ),
    );
    setManualLabel('');
    setManualProvider('');
    setManualToken('');
    setEditingAccountId('');
  };

  const handleCancelEdit = () => {
    setManualLabel('');
    setManualProvider('');
    setManualToken('');
    setEditingAccountId('');
  };

  const handleDeleteAccount = (accountId) => {
    if (confirm('Delete this account?')) {
      setManualAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      setSelectedAccountIds((prev) => prev.filter((id) => id !== accountId));
    }
  };

  const handleDeleteAllAccounts = () => {
    if (confirm('Delete ALL accounts? This cannot be undone.')) {
      setManualAccounts([]);
      setSelectedAccountIds([]);
    }
  };

  const handleLogoUpload = (file) => {
    if (!file || !activeCustomer) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, logoUrl: dataUrl } : c));
    };
    reader.readAsDataURL(file);
  };

  const overlayLogoOnImage = async (imageUrl, logoUrl) => {
    return new Promise(async (resolve) => {
      if (!logoUrl) {
        console.log('No logo URL provided');
        resolve(imageUrl);
        return;
      }
      
      console.log('Starting logo overlay. Image:', imageUrl, 'Logo:', logoUrl);
      
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create image element and load main image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          console.log('Main image loaded:', img.width, 'x', img.height);
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw main image
          ctx.drawImage(img, 0, 0);
          
          // Load and draw logo
          const logo = new Image();
          logo.crossOrigin = 'anonymous';
          
          logo.onload = () => {
            console.log('Logo loaded');
            const logoSize = Math.min(canvas.width, canvas.height) * 0.25; // Bigger logo (25%)
            const padding = 20;
            
            // Draw semi-transparent white background with rounded corners
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.roundRect(padding - 10, padding - 10, logoSize + 20, logoSize + 20, 10);
            ctx.fill();
            
            // Reset shadow for logo
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Draw logo
            ctx.drawImage(logo, padding, padding, logoSize, logoSize);
            
            // Add brand name bar at bottom
            const barHeight = 70;
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
            
            // Draw brand text
            ctx.fillStyle = '#1a1a1a';
            ctx.font = 'bold 32px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('RRNAGAR.COM', canvas.width / 2, canvas.height - barHeight / 2);
            
            const finalImage = canvas.toDataURL('image/jpeg', 0.92);
            console.log('Logo overlay complete');
            resolve(finalImage);
          };
          
          logo.onerror = (err) => {
            console.error('Logo failed to load:', err);
            // Return image with just brand bar
            const barHeight = 70;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
            ctx.fillStyle = '#1a1a1a';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RRNAGAR.COM', canvas.width / 2, canvas.height - barHeight / 2);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
          };
          
          logo.src = logoUrl;
        };
        
        img.onerror = (err) => {
          console.error('Main image failed to load:', err);
          resolve(imageUrl);
        };
        
        // For Unsplash images, add query params to avoid CORS issues
        if (imageUrl.includes('unsplash.com')) {
          img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 'auto=format&fit=crop&w=1200&q=80';
        } else {
          img.src = imageUrl;
        }
        
      } catch (err) {
        console.error('Logo overlay exception:', err);
        resolve(imageUrl);
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f7fb', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24 }}>
        <header style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h1 style={{ margin: 0 }}>Workflow: Generate - Schedule - Post</h1>
          <p style={{ color: '#6b7280' }}>Follow the steps below to generate content, schedule, and publish.</p>
        </header>

        <section style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h2>1) Add Customers</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <input
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
              placeholder="Customer name"
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', flex: 1, minWidth: 220 }}
            />
            <button onClick={handleAddCustomer} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #111827', background: '#111827', color: '#fff' }}>
              Add Customer
            </button>
          </div>
          {customers.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 12, color: '#6b7280' }}>Active customer</label>
              <select
                value={activeCustomerId}
                onChange={(e) => setActiveCustomerId(e.target.value)}
                style={{ marginLeft: 8, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {activeCustomer && (
                <span style={{ marginLeft: 12, color: '#6b7280' }}>Selected: {activeCustomer.name}</span>
              )}
            </div>
          )}
          {activeCustomer && (
            <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
              <input
                value={activeCustomer.tagline}
                onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, tagline: e.target.value } : c))}
                placeholder="Punch line"
                style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#6b7280' }}>Logo (upload or URL)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                />
                <input
                  value={activeCustomer.logoUrl}
                  onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, logoUrl: e.target.value } : c))}
                  placeholder="Logo URL (optional)"
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
                {activeCustomer.logoUrl && (
                  <img
                    src={activeCustomer.logoUrl}
                    alt="logo-preview"
                    style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: 8 }}
                  />
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <input
                  value={activeCustomer.contact}
                  onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, contact: e.target.value } : c))}
                  placeholder="Contact number"
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
                <input
                  value={activeCustomer.email}
                  onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, email: e.target.value } : c))}
                  placeholder="Email"
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
                <input
                  value={activeCustomer.website}
                  onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, website: e.target.value } : c))}
                  placeholder="Website"
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
              </div>
              <textarea
                value={activeCustomer.description}
                onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, description: e.target.value } : c))}
                placeholder="Business description (products, services, consultancy)"
                rows={3}
                style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <input
                value={activeCustomer.imagePrompt}
                onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, imagePrompt: e.target.value } : c))}
                placeholder="Image prompt (e.g., ecommerce storefront, delivery, consulting, professional, modern)"
                style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <input
                  value={activeCustomer.launchContext}
                  onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, launchContext: e.target.value } : c))}
                  placeholder="Launch context (e.g., Launched one week ago)"
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
                <input
                  value={activeCustomer.audience}
                  onChange={(e) => setCustomers((prev) => prev.map((c) => c.id === activeCustomer.id ? { ...c, audience: e.target.value } : c))}
                  placeholder="Target audience"
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>
          )}
        </section>

        <section style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h2>2) Connect & Select Accounts</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={loadAccounts} 
                style={{ 
                  padding: '10px 16px', 
                  borderRadius: 6, 
                  border: '1px solid #2563eb', 
                  background: '#2563eb', 
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                Refresh Accounts
              </button>
              <a 
                href="/"
                style={{ 
                  padding: '10px 16px', 
                  borderRadius: 6, 
                  border: '1px solid #10b981', 
                  background: '#10b981', 
                  color: '#fff',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                Connect Accounts (OAuth)
              </a>
              <div style={{ fontSize: 13, color: '#6b7280', marginLeft: 'auto' }}>
                {accounts.length} account(s) loaded | {selectedAccountIds.filter((id) => accounts.some((a) => a.id === id && isAccountPostable(a))).length} selected
              </div>
            </div>
            
            {organizationOptions.length > 2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Organization folder:</label>
                <select
                  value={selectedOrgFilter}
                  onChange={(e) => setSelectedOrgFilter(e.target.value)}
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', minWidth: 220 }}
                >
                  {organizationOptions.map((org) => (
                    <option key={org} value={org}>
                      {org === 'all' ? 'All organizations' : org}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Assign selected to organization:</label>
              <select
                value={targetOrganizationId}
                onChange={(e) => setTargetOrganizationId(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', minWidth: 220 }}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignSelectedToOrganization}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}
              >
                Move Selected
              </button>
            </div>
            {accounts.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: 8, border: '1px dashed #e5e7eb' }}>
                <p style={{ margin: 0, marginBottom: 12 }}>No accounts connected yet.</p>
                <p style={{ margin: 0, fontSize: 14 }}>Click "Connect Accounts" above to connect via OAuth, or add manually below</p>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 12 }}>Select accounts to post to:</label>
                <div style={{ display: 'grid', gap: 8 }}>
                  {organizationGroups.map(([orgName, orgAccounts]) => (
                    <div key={orgName} style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
                      <div style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, color: '#111827' }}>
                        {orgName}
                      </div>
                      <div style={{ display: 'grid', gap: 8, padding: 10 }}>
                        {orgAccounts.map((acc) => {
                          const platformIcons = {
                            twitter: 'T',
                            facebook: 'F',
                            instagram: 'I',
                            linkedin: 'L',
                          };
                          const icon = platformIcons[acc.platform] || 'S';
                          const disabled = !isAccountPostable(acc);

                          return (
                            <div
                              key={acc.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: 14,
                                borderRadius: 8,
                                border: selectedAccountIds.includes(acc.id) ? '2px solid #2563eb' : '1px solid #e5e7eb',
                                background: selectedAccountIds.includes(acc.id) ? '#eff6ff' : '#fff',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.65 : 1,
                                transition: 'all 0.2s',
                              }}
                              onClick={() => {
                                if (!disabled) toggleAccountSelection(acc.id);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAccountIds.includes(acc.id)}
                                onChange={() => {
                                  if (!disabled) toggleAccountSelection(acc.id);
                                }}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                                onClick={(e) => e.stopPropagation()}
                                disabled={disabled}
                              />
                              <span style={{ fontSize: 24 }}>{icon}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, color: '#111827' }}>{acc.label || acc.provider}</div>
                                <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'capitalize' }}>
                                  {acc.platform}
                                </div>
                                {disabled && (
                                  <div style={{ color: '#b91c1c', fontSize: 11, marginTop: 2 }}>
                                    {acc.postabilityReason || 'Not postable'}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: 'pointer', padding: '10px', background: '#f9fafb', borderRadius: 6, fontWeight: 600 }}>
                + Add Account Manually (with Access Token)
              </summary>
              <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 6, marginTop: 8 }}>
                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <input
                    value={manualLabel}
                    onChange={(e) => setManualLabel(e.target.value)}
                    placeholder="Label (e.g., RR Nagar Page)"
                    style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                  <input
                    value={manualProvider}
                    onChange={(e) => setManualProvider(e.target.value)}
                    placeholder="Provider/Page ID"
                    style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                  <select
                    value={manualPlatform}
                    onChange={(e) => setManualPlatform(e.target.value)}
                    style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                  </select>
                  <input
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Access Token"
                    style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', gridColumn: 'span 3' }}
                    type="password"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualAccount}
                    style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}
                  >
                    Add Account
                  </button>
                </div>
              </div>
            </details>
          </div>
        </section>

        <section style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h2>3) Generate Text, Image, Video</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (e.g. Launching a new clinic in Dubai)"
              style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <button onClick={handleGenerate} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', width: 'fit-content' }}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
            {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
          </div>
          {resultText && (
            <div style={{ marginTop: 16 }}>
              <h3>Generated Text</h3>
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                rows={6}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              {hashtags && (
                <div style={{ marginTop: 12, padding: 12, background: '#f3f4f6', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                  <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 8 }}>Hashtags for Maximum Reach</label>
                  <textarea
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #d1d5db', fontFamily: 'monospace', fontSize: 12 }}
                  />
                </div>
              )}
            </div>
          )}
          {(resultText || topic) && activeCustomer && (
            <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8, border: '2px dashed #d1d5db' }}>
              <h3 style={{ margin: 0, marginBottom: 12, fontSize: 14, fontWeight: 600, color: '#374151' }}>Post Preview (exactly what will be published):</h3>
              <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui', lineHeight: 1.6, padding: 12, background: '#fff', borderRadius: 6 }}>
                {resultText || topic}
                {'\n\n'}
                {[activeCustomer.tagline, activeCustomer.website, activeCustomer.email, activeCustomer.contact].filter(Boolean).join(' | ')}
                {hashtags && `\n\n${hashtags}`}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                Character count: {((resultText || topic) + '\n\n' + [activeCustomer.tagline, activeCustomer.website, activeCustomer.email, activeCustomer.contact].filter(Boolean).join(' | ') + (hashtags ? '\n\n' + hashtags : '')).length}
              </div>
            </div>
          )}
          <div style={{ marginTop: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Selected Media For Post/Schedule</div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 14 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input type="radio" checked={selectedMediaType === 'image'} onChange={() => setSelectedMediaType('image')} />
                Image
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: videos.length ? 1 : 0.5 }}>
                <input type="radio" checked={selectedMediaType === 'externalVideo'} onChange={() => setSelectedMediaType('externalVideo')} disabled={!videos.length} />
                External Video
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: animatedVideoUrl ? 1 : 0.5 }}>
                <input type="radio" checked={selectedMediaType === 'animatedVideo'} onChange={() => setSelectedMediaType('animatedVideo')} disabled={!animatedVideoUrl} />
                Animated Video
              </label>
            </div>
            <div style={{ marginTop: 6, color: '#6b7280', fontSize: 12 }}>
              Current: <b>{selectedMediaType}</b> {selectedMediaType === 'image' ? '(posting supported)' : '(preview/download now; posting fallback to image)'}
            </div>
          </div>
          {images.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3>Generated Images</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {images.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => {
                      setSelectedImage(img);
                      setSelectedMediaType('image');
                    }}
                    style={{ border: selectedImage === img ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 8, padding: 4, background: '#fff' }}
                  >
                    <img src={img} alt="generated" style={{ width: '100%', borderRadius: 6 }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3>Generated Videos (15-20s)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {videos.map((videoUrl) => {
                  const isYouTube = typeof videoUrl === 'string' && videoUrl.includes('youtube.com/embed/');
                  const isSelected = selectedMediaType === 'externalVideo' && selectedVideo === videoUrl;
                  return (
                    <div
                      key={videoUrl}
                      onClick={() => {
                        setSelectedVideo(videoUrl);
                        setSelectedMediaType('externalVideo');
                      }}
                      style={{ border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff', cursor: 'pointer' }}
                    >
                      {isYouTube ? (
                        <iframe
                          src={videoUrl}
                          title="generated-video"
                          style={{ width: '100%', aspectRatio: '9 / 16', border: 0 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={videoUrl}
                          controls
                          preload="metadata"
                          style={{ width: '100%', aspectRatio: '9 / 16', background: '#000' }}
                        />
                      )}
                      <div style={{ padding: 8, fontSize: 12 }}>
                        <a href={videoUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Open video</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={createAnimatedReel}
              disabled={isAnimatingVideo}
              style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #0f172a', background: '#0f172a', color: '#fff', cursor: isAnimatingVideo ? 'not-allowed' : 'pointer', opacity: isAnimatingVideo ? 0.6 : 1 }}
            >
              {isAnimatingVideo ? 'Selecting Free Reel...' : 'Use Free Reel (No Paid API)'}
            </button>
            {animatedVideoUrl && (
              <a href={animatedVideoUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
                Open Free Reel
              </a>
            )}
          </div>
          {animatedVideoUrl && (
            <div style={{ marginTop: 12, maxWidth: 360 }}>
              <video
                src={animatedVideoUrl}
                controls
                onClick={() => setSelectedMediaType('animatedVideo')}
                style={{ width: '100%', borderRadius: 8, border: selectedMediaType === 'animatedVideo' ? '2px solid #2563eb' : '1px solid #e5e7eb', background: '#000', cursor: 'pointer' }}
              />
            </div>
          )}
          {videos.length === 0 && (
            <div style={{ marginTop: 12, padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#6b7280', fontSize: 13 }}>
              No generated video URL available for this topic right now. Status: <b>{videoStatus || 'no_video_result'}</b>.  
              The 15-20s storyboard plan below can still be used to create the final reel.
            </div>
          )}
          {videoPlan && (
            <div style={{ marginTop: 16 }}>
              <h3>15-20s Video Plan (no links)</h3>
              <div style={{ color: '#374151' }}>
                <div>Duration: {videoPlan.durationSeconds}s</div>
                <div>Format: {videoPlan.format}</div>
                <ul style={{ marginTop: 8 }}>
                  {videoPlan.script?.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {videoPlan.notes && <div style={{ marginTop: 8, color: '#6b7280' }}>{videoPlan.notes}</div>}
              </div>
            </div>
          )}
        </section>

        <section style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h2>4) Schedule</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            {[3, 7, 15, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setPlanDays(days)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: planDays === days ? '1px solid #111827' : '1px solid #e5e7eb',
                  background: planDays === days ? '#111827' : '#fff',
                  color: planDays === days ? '#fff' : '#111827',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {days}-day planner
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 8,
                marginBottom: 8,
                color: '#6b7280',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} style={{ textAlign: 'center' }}>{day}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {planWeeks.map((week, wIdx) => (
                <div
                  key={`week-${wIdx}`}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8 }}
                >
                  {week.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        background: '#fafafa',
                        padding: 8,
                        minHeight: 70,
                        display: 'grid',
                        gap: 6,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{item.date}</div>
                      <div style={{ color: '#2563eb', fontWeight: 600 }}>{item.type}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} />
            <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e7eb' }} />
            <button onClick={handleSchedule} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #111827', background: '#111827', color: '#fff' }}>
              Add to Schedule
            </button>
          </div>
          {scheduledItems.length > 0 && (
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {scheduledItems.map((item) => (
                <div key={item.id} style={{ padding: 10, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  {new Date(item.scheduledTime).toLocaleString()} | {item.status} | {(item.accounts || []).map((a) => a.platform).join(', ')}
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h2>5) Post Now</h2>
          <div style={{ padding: 16 }}>
            <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
              {!useSchedule ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={handlePostNow} 
                    style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #16a34a', background: '#16a34a', color: '#fff', flex: 1, cursor: 'pointer' }}
                  >
                    Post to {selectedAccountIds.filter((id) => accounts.some((a) => a.id === id && isAccountPostable(a))).length} account(s)
                  </button>
                  <button 
                    onClick={() => setUseSchedule(true)} 
                    style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #7c3aed', background: '#fff', color: '#7c3aed', cursor: 'pointer' }}
                  >
                    Schedule
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 8, padding: 12, border: '2px dashed #7c3aed', borderRadius: 8, background: '#faf5ff' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed' }}>Schedule Post</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                    />
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={handlePostNow} 
                      style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #7c3aed', background: '#7c3aed', color: '#fff', flex: 1, cursor: 'pointer' }}
                    >
                      Schedule for later
                    </button>
                    <button 
                      onClick={() => {
                        setUseSchedule(false);
                        setScheduleDate('');
                        setScheduleTime('');
                      }} 
                      style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', color: '#111827', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}




