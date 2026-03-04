export default function ContentAssetCard() {
  // Example asset data
  const asset = {
    image: 'https://via.placeholder.com/120x80.png?text=Asset',
    title: 'Sample Asset',
    description: 'This is a description of the asset. It can be an image, video, or document used in your content.'
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, maxWidth: 220, textAlign: 'center', background: '#fafafa' }}>
      <img src={asset.image} alt={asset.title} style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{asset.title}</div>
      <div style={{ fontSize: 14, color: '#555' }}>{asset.description}</div>
    </div>
  );
}
