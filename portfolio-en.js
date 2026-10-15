const archiveLabels = {
  architecture: 'Architecture',
  training: 'Training',
  writing: 'Literature',
  international: 'International experience',
  logos: 'Logo design',
  '3d': '3D visualisation',
  administration: 'Administration',
  art: 'Art & drawing',
  certificates: 'Certificates',
  personal: 'Personal moments',
  media: 'Media & public engagement'
};
const archiveTitles = {
  architecture: 'Architectural project',
  training: 'Training experience',
  writing: 'Literary archive',
  international: 'International programme',
  logos: 'Logo concept',
  '3d': '3D visualisation study',
  administration: 'Administrative experience',
  art: 'Original artwork',
  certificates: 'Certificate & achievement',
  personal: 'Career moment',
  media: 'Media & public engagement'
};
const archiveCounts = Object.create(null);
window.portfolioItems = (window.portfolioItems || []).map(item => {
  const category = item.category;
  const count = archiveCounts[category] = (archiveCounts[category] || 0) + 1;
  const number = String(count).padStart(2, '0');
  const label = archiveLabels[category] || 'Selected work';
  const title = `${archiveTitles[category] || label} — ${number}`;
  return { ...item, label, title: item.englishTitle || title, alt: `${label}: ${item.englishTitle || title}` };
});
