
import React, { useEffect, useMemo, useState } from 'react';
import { UserContext, RoleCard } from '../types';
import { generateRolePossibilities } from '../geminiService';
import { StepLayout } from './StepLayout';
import { AnalysisProgressDisplay } from './AnalysisProgressDisplay';

interface ExplorationPageProps {
  context: UserContext;
  cachedRoles: RoleCard[] | null;
  onRolesFetched: (roles: RoleCard[]) => void;
  onSelectRole: (role: RoleCard) => void;
  onExit: (type: 'not_for_me' | 'unsure') => void;
  onBack?: () => void;
}

const ExplorationPageInner: React.FC<ExplorationPageProps> = ({
  context,
  cachedRoles,
  onRolesFetched,
  onSelectRole,
  onExit,
  onBack,
}) => {
  const [roles, setRoles] = useState<RoleCard[]>(cachedRoles || []);
  const [loading, setLoading] = useState<boolean>(() => !(cachedRoles && cachedRoles.length > 0));

  const [selectedRole, setSelectedRole] = useState<RoleCard | null>(null);

  // loading animation states
  const [analysisStep, setAnalysisStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // detail expand states
  const [expandedWhy, setExpandedWhy] = useState(false);
  const [expandedAssumptions, setExpandedAssumptions] = useState(false);
  const [expandedUncertainties, setExpandedUncertainties] = useState(false);

  const synthesisSteps = useMemo(
    () => [
      { id: 'context', label: 'CONTEXT DISTILLATION', progress: 20 },
      { id: 'directional', label: 'DIRECTIONAL ANALYSIS', progress: 40 },
      { id: 'possibility', label: 'POSSIBILITY MAPPING', progress: 60 },
      { id: 'constraint', label: 'CONSTRAINT CHECKING', progress: 80 },
      { id: 'role', label: 'ROLE SYNTHESIS', progress: 95 },
    ],
    []
  );

  const synthesisConsoleLogs = useMemo(
    () => [
      { text: 'QUERYING MARKET_TAXONOMY: PIVOT_PATH_ALPHA' },
      { text: 'GENERATING HYPOTHESIS: ADJACENT_ROLE_MATCH', highlight: true },
      { text: 'OPTIMIZING ASSET_REUSE_RATIO...' },
      { text: `MAPPING CONTEXT: ${context.origin} → ${context.considering.join(', ')}` },
      { text: 'FINALIZING ROLE RECOMMENDATIONS...' },
    ],
    [context.origin, context.considering]
  );

  // Reset expanded state when switching roles
  useEffect(() => {
    setExpandedWhy(false);
    setExpandedAssumptions(false);
    setExpandedUncertainties(false);
  }, [selectedRole?.id]);

  // Fetch roles (with caching)
  useEffect(() => {
    let cancelled = false;

    const hasCache = cachedRoles && cachedRoles.length > 0;
    if (hasCache) {
      setRoles(cachedRoles);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      setLoading(true);
      try {
        const res = await generateRolePossibilities(context);
        // brief minimum delay so loading animation doesn't flash
        await new Promise((r) => setTimeout(r, 350));
        if (cancelled) return;
        setRoles(res);
        onRolesFetched(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRoles();
    return () => {
      cancelled = true;
    };
  }, [context, cachedRoles, onRolesFetched]);

  // Rotate through analysis steps while loading
  useEffect(() => {
    if (!loading) return;

    const stepInterval = window.setInterval(() => {
      setAnalysisStep((prev) => {
        const next = prev + 1;
        return next >= synthesisSteps.length ? prev : next;
      });
    }, 2000);

    const timeInterval = window.setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timeInterval);
    };
  }, [loading]);

  if (loading) {
    const activeProgress = 60 + (elapsedTime % 4) * 10;
    return (
      <StepLayout title="" subtitle="">
        <AnalysisProgressDisplay
          title="SYNTHESIS ENGINE"
          subtitle="Finalizing your exploration dashboard..."
          steps={synthesisSteps}
          currentStepIndex={analysisStep}
          activeStepProgress={activeProgress}
          consoleTitle="NEURAL NETWORK REASONING LAYER"
          consoleLogs={synthesisConsoleLogs}
          activeStatus="ACTIVE"
        />
      </StepLayout>
    );
  }

  // Role overview screen
  if (!selectedRole) {
    return (
      <StepLayout title="Role possibilities" subtitle="Pick one to explore. You can change later.">
        <div className="space-y-6">
          {/* Context chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <i className="fas fa-sign-out-alt mr-1.5"></i>
              {context.origin}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <i className="fas fa-compass mr-1.5"></i>
              {context.considering.slice(0, 2).join(', ')}
            </span>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role, idx) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`group bg-white rounded-2xl border p-5 text-left transition-all duration-150
                  ${idx === 0 ? 'border-primary-100' : 'border-gray-200'}
                  hover:border-primary-200 hover:bg-primary-50/30`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200/80 transition-colors">
                    <i className="fas fa-briefcase"></i>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <i className="fas fa-check-circle"></i>
                    <span className="font-bold">{role.why.length}</span>
                    <span className="text-gray-500">reasons</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary-600">
                    <i className="fas fa-lightbulb"></i>
                    <span className="font-bold">{role.assumptions.length}</span>
                    <span className="text-gray-500">assumptions</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-orange-600">
                    <i className="fas fa-question-circle"></i>
                    <span className="font-bold">{role.uncertainties.length}</span>
                    <span className="text-gray-500">unknowns</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                  Explore <i className="fas fa-arrow-right ml-2 opacity-80"></i>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-5 py-2 text-gray-600 hover:text-gray-900 font-bold flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back
            </button>

            <div className="flex items-center gap-4">
              <button onClick={() => onExit('unsure')} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                Not sure yet
              </button>
              <span className="text-gray-300">•</span>
              <button onClick={() => onExit('not_for_me')} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                Skip for now
              </button>
            </div>

            <button
              onClick={() => roles.length > 0 && onSelectRole(roles[0])}
              disabled={roles.length === 0}
              className="px-8 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Continue <i className="fas fa-arrow-right ml-2 opacity-90"></i>
            </button>
          </div>
        </div>
      </StepLayout>
    );
  }

  // Role detail screen
  return (
    <StepLayout title={selectedRole.name} subtitle="Quick scan. One action.">
      <div className="space-y-6">
        <button
          onClick={() => setSelectedRole(null)}
          className="text-sm text-gray-600 hover:text-primary-600 font-medium flex items-center transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to all roles
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-green-700 mb-2 flex items-center gap-2">
              <i className="fas fa-check-circle"></i> Makes sense
            </div>
            <div className="space-y-2">
              {(expandedWhy ? selectedRole.why : selectedRole.why.slice(0, 2)).map((w, i) => (
                <div key={i} className="text-sm text-gray-800 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                  <span className="flex-1 min-w-0 break-words">{w}</span>
                </div>
              ))}
              {selectedRole.why.length > 2 && (
                <button
                  onClick={() => setExpandedWhy(!expandedWhy)}
                  className="text-xs text-green-600 hover:text-green-800 font-medium cursor-pointer text-left"
                >
                  {expandedWhy ? '− Show less' : `+${selectedRole.why.length - 2} more`}
                </button>
              )}
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-primary-700 mb-2 flex items-center gap-2">
              <i className="fas fa-lightbulb"></i> Assumes
            </div>
            <div className="space-y-2">
              {(expandedAssumptions ? selectedRole.assumptions : selectedRole.assumptions.slice(0, 2)).map((a, i) => (
                <div key={i} className="text-sm text-gray-800 flex items-start gap-2">
                  <span className="text-primary-600 mt-0.5 flex-shrink-0">•</span>
                  <span className="flex-1 min-w-0 break-words">{a}</span>
                </div>
              ))}
              {selectedRole.assumptions.length > 2 && (
                <button
                  onClick={() => setExpandedAssumptions(!expandedAssumptions)}
                  className="text-xs text-primary-600 hover:text-primary-800 font-medium cursor-pointer text-left"
                >
                  {expandedAssumptions ? '− Show less' : `+${selectedRole.assumptions.length - 2} more`}
                </button>
              )}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-orange-700 mb-2 flex items-center gap-2">
              <i className="fas fa-question-circle"></i> Unknowns
            </div>
            <div className="space-y-2">
              {(expandedUncertainties ? selectedRole.uncertainties : selectedRole.uncertainties.slice(0, 2)).map((u, i) => (
                <div key={i} className="text-sm text-gray-800 flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5 flex-shrink-0">•</span>
                  <span className="flex-1 min-w-0 break-words">{u}</span>
                </div>
              ))}
              {selectedRole.uncertainties.length > 2 && (
                <button
                  onClick={() => setExpandedUncertainties(!expandedUncertainties)}
                  className="text-xs text-orange-600 hover:text-orange-800 font-medium cursor-pointer text-left"
                >
                  {expandedUncertainties ? '− Show less' : `+${selectedRole.uncertainties.length - 2} more`}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-warm-200 flex flex-col items-center gap-4">
          <button
            onClick={() => onSelectRole(selectedRole)}
            className="w-full md:w-auto px-10 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors duration-200"
          >
            Explore this role <i className="fas fa-arrow-right ml-2 opacity-90"></i>
          </button>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button onClick={() => setSelectedRole(null)} className="hover:text-primary-600 transition-colors">
              See other roles
            </button>
            <span className="text-gray-300">•</span>
            <button onClick={() => onExit('unsure')} className="hover:text-gray-700 transition-colors">
              Not sure
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">You can change your mind anytime.</p>
      </div>
    </StepLayout>
  );
};

export const ExplorationPage = React.memo(ExplorationPageInner);
