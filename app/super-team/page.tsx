"use client";

import React, { useState } from "react";
import "./super-team.css";
import { API_ENDPOINTS } from "../../config/api";

export default function SuperTeamPage() {
  const [formData, setFormData] = useState({
    ownerName: "",
    ownerNIC: "",
    ownerPhone: "",
    ownerDate: "",
    driverName: "",
    driverNIC: "",
    driverPhone: "",
    driverLicenseNo: "",
    driverDate: ""
  });
  const [ownerNicFrontFile, setOwnerNicFrontFile] = useState<File | null>(null);
  const [ownerNicBackFile, setOwnerNicBackFile] = useState<File | null>(null);
  const [driverDocFrontFile, setDriverDocFrontFile] = useState<File | null>(null);
  const [driverDocBackFile, setDriverDocBackFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let value = e.target.value;

    if (field === 'ownerPhone' || field === 'driverPhone') {
      // Allow only numbers
      value = value.replace(/[^0-9]/g, '');
    } else if (field === 'ownerName' || field === 'driverName') {
      // Allow only letters (English, Sinhala, Tamil) and spaces
      value = value.replace(/[^a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF\s]/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e?: any) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!formData.ownerName || !formData.ownerNIC || !formData.ownerPhone || 
        !formData.driverName || !formData.driverNIC || !formData.driverPhone || !formData.driverLicenseNo) {
      alert("කරුණාකර සියලුම පෙළ තොරතුරු පුරවන්න (Please fill all text fields).");
      return;
    }

    if (!ownerNicFrontFile || !ownerNicBackFile || !driverDocFrontFile || !driverDocBackFile) {
      alert("කරුණාකර NIC සහ බලපත්‍රවල ඉදිරිපස සහ පිටුපස පිටපත් ඇතුළත් කරන්න (Please upload front and back copies of NIC and License).");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      data.append('ownerNicFrontFile', ownerNicFrontFile);
      data.append('ownerNicBackFile', ownerNicBackFile);
      data.append('driverDocFrontFile', driverDocFrontFile);
      data.append('driverDocBackFile', driverDocBackFile);

      const response = await fetch(API_ENDPOINTS.SUPER_TEAM, {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Submission failed");
      
      alert("තොරතුරු සාර්ථකව සුරැකිණි! (Details saved successfully!)");
      
      // Refresh the page
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(`දෝෂයකි: ${error.message} (Error saving details)`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="superTeamWrapper">
      <div className="super-team-page">
        {/* Compact Hero Header in Senu Navy Blue */}
        <div className="brand-hero">
          <div className="brand-pill">Super Team Member Network</div>
          <div className="brand-main-title">SENU CABS & TOURS</div>
          <div className="brand-sub-title">Membership Agreement Portfolio</div>
          <div className="version-tag">Version 1.0</div>
        </div>

        {/* Main Wrapper Frame */}
        <form onSubmit={handleSubmit}>
        <div className="wrapper">
          {/* Purpose Panel */}
          <div className="purpose-panel">
            <h3>Agreement Purpose</h3>
            <p>
              මෙම ගිවිසුම Senu Cabs & Tours ආයතනය හා Super Team සාමාජිකත්වය සඳහා
              අයදුම් කරන වාහන හිමිකරු සහ/හෝ රියදුරු අතර ඇති කරගනු ලබන
              එකඟතාවයකි.
            </p>
            <p style={{ color: "#475569", fontWeight: 400 }}>
              මෙම ගිවිසුමට අත්සන් කිරීම මගින් පහත සඳහන් සියලුම නියමාවලීන්,
              කොන්දේසි හා මාර්ගෝපදේශ කියවා, තේරුම්ගෙන, පිළිගන්නා බවට ඔබ එකඟ වන
              බව සැලකේ.
            </p>
          </div>

          {/* 1. Super Team Introduction Card */}
          <div className="section-card prime">
            <h2>1. Super Team යනු කුමක්ද?</h2>
            <p>
              Super Team යනු Senu Cabs & Tours ආයතනයේ විශ්වාසනීය, කාර්යශූර හා
              ආයතනයේ ප්‍රමිතීන්ට අනුකූල රියදුරු මහතුන් 200 දෙනෙකුගෙන් සමන්විත
              විශේෂ කණ්ඩායමකි.
            </p>
            <p>
              Super Team වෙත ඇතුළත් විය හැක්කේ ඔබ විසින් අයදුම්පත ඉදිරිපත්
              කිරීමෙන් පසු, ඔබගේ වාහනය ආයතනය විසින් පරීක්ෂා කර කළමනාකාරීත්ව
              අනුමැතිය ලබා දීමෙන් අනතුරුව පමණි. අනුමැතිය ලැබීමෙන් පසු පහත පැකේජ
              වලින් ඔබට සුදුසු පැකේජය තෝරාගත හැක.
            </p>

            <table>
              <thead>
                <tr>
                  <th>පැකේජ ගාස්තුව (Package Fee)</th>
                  <th>උපරිම Hire වටිනාකම (Max Hire Value)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style={{ color: "#0a2540" }}>රු. 1,000</strong>
                  </td>
                  <td>රු. 25,000</td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0a2540" }}>රු. 2,000</strong>
                  </td>
                  <td>රු. 50,000</td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0a2540" }}>රු. 3,000</strong>
                  </td>
                  <td>රු. 100,000</td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0a2540" }}>රු. 4,000</strong>
                  </td>
                  <td>රු. 150,000</td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0a2540" }}>රු. 5,000</strong>
                  </td>
                  <td>රු. 200,000</td>
                </tr>
              </tbody>
            </table>

            <div className="light-green-badge-box">
              ⚠️ විශේෂ නියමය: නවක රියදුරන් සඳහා රු. 1,000 පැකේජයෙන් පමණක් ආරම්භ
              කළ යුතුය.
            </div>
          </div>

          {/* Flow Blocks */}
          <div className="section-card">
            <h2>2. පැකේජ වලංගු කාලය</h2>
            <ul className="clean-list">
              <li>
                සෑම Super Team Package එකක්ම අදාළ දින දර්ශන මාසය සඳහා පමණක්
                වලංගු වේ.
              </li>
              <li>
                Super Team සාමාජිකත්වය ස්වයංක්‍රීයව අලුත් නොවන අතර සෑම මාසයකම
                නැවත සක්‍රීය කළ යුතුය.
              </li>
            </ul>
          </div>

          <div className="section-card">
            <h2>3. Hire වටිනාකම ගණනය කිරීම</h2>
            <p>
              Hire වටිනාකම ලෙස සලකනු ලබන්නේ පාරිභෝගිකයා වෙත ඉදිරිපත් කරන ලද
              සම්පූර්ණ Hire වටිනාකමයි.
            </p>
          </div>

          <div className="section-card prime">
            <h2>4. Driver App භාවිතය</h2>
            <ul className="clean-list">
              <li>
                දායකත්ව මුදල ගෙවීමෙන් පසු Driver App හරහා Open Trips වෙත
                ප්‍රවේශ වීමට අවසර ලැබේ.
              </li>
              <li>
                Open Trips තුළ දර්ශනය වන්නේ අද දිනට පසුව ඇති Hire පමණි.
              </li>
              <li>
                අද දිනට අදාළ Hire අදාළ මාසයේ Super Team WhatsApp සමූහය වෙත යොමු
                කරනු ලැබේ.
              </li>
              <li>
                එම Hire ලබා ගැනීම සඳහා WhatsApp පණිවිඩයේ සඳහන් දුරකථන අංකය
                අමතා Hire ඉල්ලා ලබාගත යුතුය.
              </li>
            </ul>
          </div>

          <div className="section-card">
            <h2>5. Hire ලබාගැනීම</h2>
            <ul className="clean-list">
              <li>
                App එක නිරන්තරයෙන් පරීක්ෂා කර Trip Request ඉදිරිපත් කිරීම ඔබගේ
                වගකීමකි.
              </li>
              <li>
                Open Trips හරහා ගොස් Hire ලබා ගන්නා ආකාරය පහත Video Link මගින්
                වටහා ගත හැක.
                <br />
                <span style={{ color: "#0a2540", fontWeight: "bold" }}>
                  Video Link :
                </span>{" "}
                <span style={{ color: "#94a3b8" }}>
                  ______________________________________
                </span>
              </li>
              <li>
                ආයතනය විසින් දුරකථනයෙන් Hire ලබාදෙනුයේ Request නොකළ Hire සඳහා
                පමණි.
              </li>
              <li>
                App එක පරීක්ෂා නොකිරීම හෝ ඇමතුම්වලට ප්‍රතිචාර නොදීම හේතුවෙන්
                Hire අහිමි වුවහොත් ආයතනය වගකීම දරන්නේ නැත.
              </li>
              <li>
                Hire පවතින්නේදැයි විමසීම සඳහා ආයතනික අංකය:{" "}
                <strong style={{ color: "#0a2540" }}>072 378 7787</strong>
              </li>
            </ul>
          </div>

          <div className="section-card">
            <h2>6. Hire ලබාදීමේ ප්‍රතිපත්තිය</h2>
            <p>
              Hire ලබාදීමේ අවසන් තීරණය ආයතනය සතු වේ. ආයතනය විසින් ලබා දෙන Hire
              වලින් <strong>85% කට වැඩි ප්‍රමාණයක්</strong> Super Team
              සාමාජිකයින් වෙත ලබා දෙනු ලැබේ. පහත කරුණු සලකා Hire ලබා දෙනු
              ලැබේ:
            </p>
            <ul className="clean-list" style={{ marginTop: "10px" }}>
              <li>රියදුරුගේ කාර්ය සාධනය සහ Customer Feedback වාර්තා</li>
              <li>ධාවනය කරනු ලබන වාහන වර්ගය සහ රියදුරුගේ වත්මන් ස්ථානය</li>
              <li>පාරිභෝගික අවශ්‍යතාවය මෙන්ම පෙර සේවා වාර්තාව</li>
            </ul>
          </div>

          <div className="section-card">
            <h2>7. Package සීමාව හා Top-Up</h2>
            <ul className="clean-list">
              <li>
                Package සීමාව සම්පූර්ණ වූ විට App එක ස්වයංක්‍රීයව අක්‍රිය වේ.
                නැවත භාවිතය සඳහා Top-Up කිරීම අවශ්‍ය වේ.
              </li>
              <li>
                Package සීමාව ඉක්මවා ගියහොත් එම අතිරික්ත මුදල ඊළඟ Top-Up
                මුදලෙන් අඩු කරනු ලැබේ.
              </li>
              <li>
                Package සීමාව ඉක්මවා ගිය අවස්ථාවක අවම වශයෙන් ඉක්මවා ගිය මුදලට
                සමාන හෝ ඊට වැඩි මුදලක් Top-Up කළ යුතුය.
              </li>
              <li>
                රු. 2,000 පැකේජයෙන් පසුව ගෙවන සෑම අමතර රු. 1,000 කටම රු. 50,000
                ක අමතර Hire වටිනාකමක් හිමිවේ.
              </li>
            </ul>
          </div>

          <div className="section-card">
            <h2>8. Carry Forward පහසුකම</h2>
            <p>
              ආයතනය විසින් Package එකට අදාළ Hire වටිනාකම ලබාදීමට අපොහොසත්
              වුවහොත් ඉතිරි Hire වටිනාකම ඊළඟ මාසයට රැගෙන යනු ලැබේ. මෙය වලංගු
              වන්නේ අඛණ්ඩව Super Team සාමාජිකත්වය පවත්වාගෙන යන රියදුරන් සඳහා
              පමණි. කිසියම් මාසයක සාමාජිකත්වය අහිමි වුවහොත් පෙර ඉතිරි වූ ශේෂය
              ඉදිරියට ගෙන නොයනු ලැබේ.
            </p>
          </div>

          <div className="section-card">
            <h2>9. Ride Meter භාවිතය</h2>
            <ul className="clean-list">
              <li>
                සෑම ගමනක් ආරම්භයේදී හා අවසානයේදී Ride Meter භාවිතා කිරීම
                අනිවාර්ය වේ. එමගින් ගාස්තු ස්වයංක්‍රීයව ගණනය වේ.
              </li>
              <li>
                Trip Summary එක ගමන අවසානයේ පාරිභෝගිකයා වෙත යැවිය යුතුය.
              </li>
              <li>
                Ride Meter භාවිතා නොකිරීම ආයතන නීති උල්ලංඝනය කිරීමක් ලෙස සලකනු
                ලැබේ.
              </li>
            </ul>
          </div>

          <div className="section-card">
            <h2>10. ගෙවීම් තහවුරු කිරීම</h2>
            <p>
              දායකත්ව හා කොමිස් ගෙවීම් සිදුකළ පසු, බැංකු තැන්පතු විස්තර Payments
              අංශය හරහා App එකට ඇතුළත් කළ යුතුය.
            </p>
          </div>

          {/* 10A Block Managed Intact */}
          <div className="critical-warning-card">
            <h4>🚨 10A. කොමිස් ගෙවීම් හා Account Status</h4>
            <p>
              <strong>
                Super Team දායකත්ව මුදල ගෙවා තිබීම පමණක් Hire ලබා ගැනීම සඳහා
                ප්‍රමාණවත් නොවේ.
              </strong>{" "}
              රියදුරු මහතාගේ ගිණුමේ ගෙවිය යුතු කොමිස් මුදල රු. 2,000/- ඉක්මවා
              ඇත්නම්, එම ගිණුම ස්වයංක්‍රීයව Block කරනු ලැබේ.
            </p>
            <p
              style={{
                margin: "10px 0 5px 0",
                fontWeight: 800,
                color: "#991b1b",
              }}
            >
              ගිණුම Block වී ඇති කාලසීමාව තුළ:
            </p>
            <ul className="critical-ul">
              <li>Open Trips සඳහා Request කිරීමට සපුරා නොහැක.</li>
              <li>WhatsApp සමූහය හරහා Hire ලබා ගැනීමට අවස්ථාව අහිමි වේ.</li>
              <li>ආයතනය විසින් කිසිදු සෘජු Hire එකක් වෙන්කර දෙනු නොලැබේ.</li>
              <li>Super Team හි සියලුම පහසුකම් තාවකාලිකව අත්හිටුවනු ලැබේ.</li>
            </ul>
            <p
              style={{
                fontSize: "9.5pt",
                lineHeight: 1.4,
                color: "#991b1b",
                marginTop: "10px",
                fontStyle: "italic",
                borderTop: "1px dashed #fee2e2",
                paddingTop: "8px",
              }}
            >
              Block කර ඇති ගිණුම නැවත සක්‍රීය කරනු ලබන්නේ හිඟ කොමිස් මුදල්
              සම්පූර්ණයෙන්ම ගෙවා තහවුරු කිරීමෙන් පසුව පමණි. කොමිස් මුදල්
              නොගෙවීම හේතුවෙන් ගිණුම Block වී ඇති කාලසීමාව තුළ අහිමි වන Hire
              අවස්ථා Package වටිනාකමට, Carry Forward ශේෂයට හෝ වෙනත් කිසිදු වන්දි
              ගෙවීමකට ඇතුළත් කරනු නොලැබේ.
            </p>
          </div>

          {/* Grouping Remaining Legal Clauses Dynamically */}
          <div className="section-card">
            <h2>11. වාහන ප්‍රමිතීන්</h2>
            <p>
              Super Team සඳහා අනුමත කරන ලද වාහනය පිරිසිදුව, ආරක්ෂිතව හා හොඳ
              ධාවන තත්ත්වයක පවත්වාගෙන යා යුතුය. අවශ්‍ය අවස්ථාවලදී වාහනය නැවත
              පරීක්ෂා කිරීමේ අයිතිය ආයතනය සතු වේ.
            </p>
          </div>

          <div className="section-card">
            <h2>12. රියදුරුගේ වෘත්තීය හැසිරීම</h2>
            <p>
              රියදුරු මහතා සෑම අවස්ථාවකදීම සුදුසු ඇඳුමින්, විනීත භාෂාවෙන්,
              වෘත්තීයමය හැසිරීමකින් සහ පාරිභෝගික ගෞරවය ආරක්ෂා කරමින් කටයුතු කළ
              යුතුය.
            </p>
          </div>

          <div className="section-card">
            <h2>13. පාරිභෝගික තොරතුරු ආරක්ෂාව</h2>
            <p>
              පාරිභෝගික දුරකථන අංක, ලිපින, ගමන් විස්තර හෝ වෙනත් පෞද්ගලික
              තොරතුරු තෙවන පාර්ශවයකට ලබාදීම තහනම් වේ.
            </p>
          </div>

          <div className="section-card">
            <h2>14. Direct Deals තහනම් කිරීම</h2>
            <p style={{ color: "#991b1b", fontWeight: 600 }}>
              ආයතනය හරහා හඳුනාගත් පාරිභෝගිකයන් සමඟ ආයතනය මඟහැර සෘජු ගනුදෙනු
              කිරීම සම්පූර්ණයෙන්ම තහනම් වේ.
            </p>
          </div>

          <div className="section-card">
            <h2>15. Hire හුවමාරු කිරීම තහනම් කිරීම</h2>
            <p>
              Open Trips හෝ Super Team WhatsApp Group හරහා ලැබෙන Hire වෙනත්
              රියදුරෙකුට හෝ තෙවන පාර්ශවයකට ලබාදීම සහ තොරතුරු Super Team නොවන
              පුද්ගලයන්ට හෙළි කිරීම සපුරා තහනම් වේ.
            </p>
          </div>

          <div className="section-card">
            <h2>16. Cancellation Policy</h2>
            <p>
              සාධාරණ හේතුවක් නොමැතිව Hire අවලංගු කිරීම, නැවත නැවත Trip Reject
              කිරීම, හෝ ගාස්තු වටිනාකම් සලකා Hire ප්‍රතික්ෂේප කිරීම ආයතන විනය
              උල්ලංඝනය කිරීමක් ලෙස සැලකේ.
            </p>
          </div>

          <div className="section-card">
            <h2>17. සාමාජිකත්වය අත්හිටුවිය හැකි අවස්ථා</h2>
            <p>
              Customer Complaints ලැබීම, Ride Meter භාවිතා නොකිරීම, Direct
              Deals, Hire හුවමාරු කිරීම, කොමිස් පැහැර හැරීම, හෝ ආයතනයේ
              කීර්තිනාමයට හානි වන අයුරින් කටයුතු කිරීමකදී සාමාජිකත්වය අත්හිටුවීමට
              හෝ අවලංගු කිරීමට ආයතනයට අයිතිය ඇත.
            </p>
          </div>

          <div className="section-card">
            <h2>18. Refund Policy</h2>
            <p>
              Super Team සඳහා සිදුකරන කිසිදු ගෙවීමක් Refund කරනු නොලැබේ.
              සාමාජිකත්වය අත්හිටුවීම, අවලංගු කිරීම හෝ Account Block වීම් වලදීද
              කිසිදු ශේෂයක් Refund නොකෙරේ.
            </p>
          </div>

          <div className="section-card">
            <h2>19. Hire Guarantee නොමැති බව</h2>
            <p>
              ආයතනය විසින් උපරිම උත්සාහය දරන නමුත් කිසිදු Package එකක් සඳහා
              නිශ්චිත Hire ප්‍රමාණයක්, ආදායමක් හෝ Booking වටිනාකමක් සහතික
              නොකරයි.
            </p>
          </div>

          <div className="section-card">
            <h2>20. Force Majeure</h2>
            <p>
              ඉන්ධන හිඟය, ස්වාභාවික ආපදා, රජයේ නියෝග, දේශපාලන තත්ත්වයන් හෝ
              පද්ධති දෝෂ වැනි පාලනයෙන් බැහැර හේතු මත Hire ප්‍රමාණය අඩුවීම
              සම්බන්ධයෙන් ආයතනය වගකීම දරන්නේ නැත.
            </p>
          </div>

          <div className="section-card">
            <h2>21. නීති සංශෝධනය කිරීම</h2>
            <p>
              Super Team නීති, කොන්දේසි, Package වටිනාකම්, App පහසුකම් හා සේවා
              කොන්දේසි අවශ්‍ය අවස්ථාවලදී සංශෝධනය කිරීමේ පූර්ණ අයිතිය ආයතනය සතු
              වේ.
            </p>
          </div>

          <div className="section-card prime">
            <h2>22. සම්බන්ධතා</h2>
            <p>
              Super Team සම්බන්ධ ගැටලු හා විමසීම් සඳහා සන්නිවේදනය:{" "}
              <strong style={{ color: "#0a2540", fontSize: "11pt" }}>
                📞 070 597 8978
              </strong>
            </p>
          </div>

          <div className="section-card">
            <h2>23. වාහන හිමිකරු හා රියදුරුගේ වගකීම</h2>
            <p>
              අයදුම් කර අත්සන් තබනු ලබන්නේ වාහන හිමිකරු වුවද, රියදුරු මහතාගේ
              සියලුම ක්‍රියාකාරකම් සඳහා අවසාන වගකීම වාහන හිමිකරු සතු වේ. ආයතනයේ
              පූර්ව අනුමැතියකින් තොරව වෙනත් රියදුරෙකු Super Team Hire සඳහා
              යෙදවීම තහනම් වේ.
            </p>
          </div>

          <div className="section-card">
            <h2>24. රියදුරුගේ හැසිරීම හා සේවා ප්‍රමිතීන්</h2>
            <p>
              සියලුම රියදුරන් වලංගු රියදුරු බලපත්‍රයක් සහිත විය යුතු අතර,
              විනීතව, Ride Meter සහ Driver App නිසි ලෙස භාවිතා කරමින් ආයතනයේ
              සියලුම නීති පිළිපැදිය යුතුය.
            </p>
          </div>

          <div className="section-card">
            <h2>25. රියදුරු වෙනස් කිරීම</h2>
            <p>
              ලියාපදිංචි රියදුරු වෙනස් කිරීමේදී නව රියදුරුගේ නම, දුරකථන අංකය,
              NIC අංකය සහ බලපත්‍ර විස්තර ආයතනය වෙත ඉදිරිපත් කර පූර්ව අනුමැතිය
              ලබාගත යුතුය.
            </p>
          </div>

          {/* Clean Executions Segment Engineered to stick together on page boundary */}
          <div className="execution-container">
            <h2>26. ද්විත්ව අත්සන් ප්‍රකාශය (Declaration)</h2>
            <p
              style={{
                backgroundColor: "#f1f5f9",
                padding: "12px",
                borderRadius: "6px",
                fontStyle: "italic",
                fontSize: "9.5pt",
                color: "#475569",
                marginBottom: "20px",
                borderLeft: "4px solid #4ade80",
              }}
            >
              මම/අපි මෙම ගිවිසුමේ සඳහන් සියලුම නියමාවලීන්, කොන්දේසි හා මාර්ගෝපදේශ
              කියවා, තේරුම්ගෙන, කිසිදු බලපෑමකින් තොරව ස්වේච්ඡාවෙන් පිළිගන්නා බව
              මෙයින් සහතික කරමි/කරමු. වාහන හිමිකරු සහ රියදුරු මහතා දෙදෙනාම මෙම
              ගිවිසුම කියවා, තේරුම්ගෙන, පිළිගන්නා බවට අත්සන් කළ යුතුය.
            </p>

            {/* Owner Info Badge */}
            <div className="signature-profile-badge">
              <div className="tab-indicator navy">
                වාහන හිමිකරුගේ විස්තර (Vehicle Owner's Details)
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">නම (Name)</div>
                <input type="text" className="form-row-input" value={formData.ownerName || ""} onChange={e => handleInputChange(e, 'ownerName')} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">NIC අංකය</div>
                <input type="text" className="form-row-input" value={formData.ownerNIC || ""} onChange={e => handleInputChange(e, 'ownerNIC')} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">දුරකථන අංකය</div>
                <input type="text" className="form-row-input" value={formData.ownerPhone || ""} onChange={e => handleInputChange(e, 'ownerPhone')} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">හැඳුනුම්පත් පිටපත - ඉදිරිපස (NIC Front)</div>
                <input type="file" accept="image/*,application/pdf" className="form-file-input" onChange={e => setOwnerNicFrontFile(e.target.files?.[0] || null)} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">හැඳුනුම්පත් පිටපත - පිටුපස (NIC Back)</div>
                <input type="file" accept="image/*,application/pdf" className="form-file-input" onChange={e => setOwnerNicBackFile(e.target.files?.[0] || null)} />
              </div>

            </div>

            {/* Driver Info Badge */}
            <div className="signature-profile-badge">
              <div className="tab-indicator green">
                රියදුරුගේ විස්තර (Driver's Details)
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">නම (Name)</div>
                <input type="text" className="form-row-input" value={formData.driverName || ""} onChange={e => handleInputChange(e, 'driverName')} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">NIC අංකය</div>
                <input type="text" className="form-row-input" value={formData.driverNIC || ""} onChange={e => handleInputChange(e, 'driverNIC')} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">දුරකථන අංකය</div>
                <input type="text" className="form-row-input" value={formData.driverPhone || ""} onChange={e => handleInputChange(e, 'driverPhone')} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">රියදුරු බලපත්‍ර අංකය</div>
                <input type="text" className="form-row-input" value={formData.driverLicenseNo || ""} onChange={e => handleInputChange(e, 'driverLicenseNo')} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">හැඳුනුම්පත් / බලපත්‍ර පිටපත - ඉදිරිපස (Front)</div>
                <input type="file" accept="image/*,application/pdf" className="form-file-input" onChange={e => setDriverDocFrontFile(e.target.files?.[0] || null)} />
              </div>
              <div className="form-row-layout">
                <div className="form-row-label">හැඳුනුම්පත් / බලපත්‍ර පිටපත - පිටුපස (Back)</div>
                <input type="file" accept="image/*,application/pdf" className="form-file-input" onChange={e => setDriverDocBackFile(e.target.files?.[0] || null)} />
              </div>

            </div>


          </div>
        </div>

        {/* Action Button Section */}
        <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? "#94a3b8" : "#0a2540",
              color: "#ffffff",
              padding: "14px 35px",
              fontSize: "12pt",
              fontWeight: "bold",
              border: "none",
              borderRadius: "6px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "all 0.2s"
            }}
          >
            {isSubmitting ? "සුරකිමින් පවතී... (Saving...)" : "තොරතුරු සුරකින්න (Save Details)"}
          </button>
        </div>
        </form>

        {/* Solid Brand Ground Bar */}
        <div
          style={{
            backgroundColor: "#0a2540",
            color: "#94a3b8",
            textAlign: "center",
            padding: "18px",
            fontSize: "9.5pt",
            fontWeight: "bold",
            borderTop: "4px solid #4ade80",
          }}
        >
          SENU CABS & TOURS &#8226; Super Team Membership Agreement Portfolio
          – v1.0
        </div>
      </div>
    </div>
  );
}
