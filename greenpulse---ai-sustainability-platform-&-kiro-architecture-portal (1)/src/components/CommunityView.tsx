import React from 'react';
import { useGreenPulse } from '../context/GreenPulseContext';
import { ArrowLeft, Users, Trophy, Heart } from 'lucide-react';

export const CommunityView: React.FC = () => {
  const {
    ecoReports,
    likeEcoReport,
    setActiveTab,
    setRewardModalOpen,
    streakDays,
  } = useGreenPulse();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header with Back to Home */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs font-bold text-[#8fe77d] hover:text-[#d9f69b] flex items-center gap-1.5 transition-colors mb-2 bg-transparent border-0 cursor-pointer p-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home Overview</span>
          </button>
          <div className="page-heading pt-0 pb-0">
            <span className="section-kicker">BETTER, TOGETHER</span>
            <h1 className="eco-title m-0">
              The green <span>community.</span>
            </h1>
            <p className="muted mt-2">
              Little actions from people who care. Every report is a chance to inspire someone else.
            </p>
          </div>
        </div>

        <div className="actions">
          <button
            onClick={() => setActiveTab('waste')}
            className="btn btn-primary"
          >
            Share a waste report ↗
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className="btn btn-ghost"
          >
            <Trophy className="w-3.5 h-3.5 text-[#f4cc69]" />
            <span>See green champions</span>
          </button>
        </div>
      </div>

      {/* Community Feed Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#f4f4df] m-0 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8fe77d]" />
            <span>Live Community Action Stream</span>
          </h2>
          <span className="text-xs text-[#a4b9a8]">
            {ecoReports.length} environmental reports logged
          </span>
        </div>

        {ecoReports.length === 0 ? (
          <div className="panel text-center py-12">
            <p className="muted">No reports yet. Be the first to share a photo from your surroundings.</p>
            <button onClick={() => setActiveTab('waste')} className="btn btn-primary mt-4">
              Submit your first report 🌱
            </button>
          </div>
        ) : (
          <div className="grid-three" id="communityPosts">
            {ecoReports.map((report) => (
              <article key={report.id} className="feed-card">
                <div className="feed-photo">
                  {report.photo ? (
                    <img src={report.photo} alt={report.description} />
                  ) : (
                    <span>🌱</span>
                  )}
                </div>
                <div className="feed-content">
                  <div>
                    <h3>🌱 {report.author}</h3>
                    <p>{report.description}</p>
                    <small>
                      ⌖ {report.location || 'Location not added'} · {report.type}
                    </small>
                    <p style={{ marginTop: '10px' }} className="text-xs text-[#8fe77d] font-bold">
                      {report.flower} Flower earned
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#8fe77d]/15 flex items-center justify-between mt-3">
                    <button
                      onClick={() => likeEcoReport(report.id)}
                      className="like-btn flex items-center gap-1.5"
                      disabled={report.liked}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          report.liked ? 'text-[#ff9e9a] fill-[#ff9e9a]' : 'text-[#8fe77d]'
                        }`}
                      />
                      <span>{report.liked ? '♥ Cheered on!' : '♡ Cheer them on'}</span>
                    </button>
                    <span className="text-xs text-[#a4b9a8] font-mono">
                      {report.likes || 0} cheers
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 7-Day Streak Callout */}
      <section className="panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="section-kicker">7-DAY COMMUNITY COMMITMENT</span>
          <h3 className="text-lg font-bold text-[#f4f4df] m-0">
            Inspiring consistency across our planet
          </h3>
          <p className="muted m-0">
            You are on Day {streakDays} of your consecutive streak. Maintain it to receive your Letter of Appreciation.
          </p>
        </div>
        <button
          onClick={() => setRewardModalOpen(true)}
          className={`btn ${streakDays >= 7 ? 'btn-primary' : 'btn-ghost'}`}
        >
          {streakDays >= 7 ? 'Claim Green Hero Letter 🎉' : 'View Letter Preview 📜'}
        </button>
      </section>
    </div>
  );
};
