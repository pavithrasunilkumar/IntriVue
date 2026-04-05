import { useState, useEffect } from 'react';
import { Building2, Mail, MapPin, Layers, Edit2, Save, X } from 'lucide-react';
import { getCurrentUser, saveProfile } from '../api';

export function CompanyProfile() {
  const rawUser = getCurrentUser();

  const [companyData, setCompanyData] = useState({
    companyName: rawUser?.companyName || '',
    email: rawUser?.email || '',
    location: rawUser?.location || '',
    industry: rawUser?.industry || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(companyData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const data = { companyName: user.companyName || '', email: user.email || '', location: user.location || '', industry: user.industry || '' };
      setCompanyData(data);
      setEditedData(data);
    }
  }, []);

  const handleEditToggle = () => {
    if (isEditing) setEditedData(companyData);
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({ companyName: editedData.companyName, location: editedData.location, industry: editedData.industry });
      setCompanyData(editedData);
      setIsEditing(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => setEditedData({ ...editedData, [field]: value });

  const inp = "border-b border-gray-300 focus:outline-none flex-1";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-6 flex-1">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  {isEditing
                    ? <input type="text" value={editedData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="text-3xl font-bold text-gray-900 mb-2 border-b-2 border-blue-600 focus:outline-none w-full" />
                    : <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyData.companyName || 'Company Name'}</h1>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-blue-600" />
                      {isEditing
                        ? <input type="email" value={editedData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={inp} />
                        : <span>{companyData.email}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {isEditing
                        ? <input type="text" value={editedData.location} onChange={(e) => handleInputChange('location', e.target.value)} className={inp} />
                        : <span>{companyData.location}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Layers className="w-4 h-4 text-blue-600" />
                      {isEditing
                        ? <input type="text" value={editedData.industry} onChange={(e) => handleInputChange('industry', e.target.value)} className={inp} />
                        : <span>{companyData.industry}</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="p-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-60">
                      <Save className="w-5 h-5" />
                    </button>
                    <button onClick={handleEditToggle} className="p-2 bg-gray-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={handleEditToggle} className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow">
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Company</h2>
            <p className="text-gray-600 leading-relaxed">
              We are a leading technology company dedicated to innovation and excellence.
              Our team is passionate about creating solutions that make a difference.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[['25+', 'Jobs Posted'], ['150+', 'Candidates'], ['500+', 'Employees']].map(([num, label]) => (
              <div key={label} className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{num}</div>
                <p className="text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
