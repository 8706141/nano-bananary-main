import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/context';
import type { Transformation } from '../types';

interface Module {
  id: string;
  name: string;
  prompt: string;
  isActive: boolean;
  category: string;
}

interface ModuleManagerProps {
  isOpen: boolean;
  onClose: () => void;
  transformations: Transformation[];
  onUpdateTransformations: (transformations: Transformation[]) => void;
}

const ModuleManager: React.FC<ModuleManagerProps> = ({ 
  isOpen, 
  onClose, 
  transformations, 
  onUpdateTransformations 
}) => {
  const { t } = useTranslation();
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // 初始化模块列表
  useEffect(() => {
    if (isOpen) {
      const initialModules: Module[] = transformations.map(trans => ({
        id: trans.key,
        name: t(trans.titleKey),
        prompt: trans.prompt || '',
        isActive: true,
        category: trans.items ? 'category' : 'effect'
      }));
      setModules(initialModules);
    }
  }, [isOpen, transformations, t]);

  // 保存模块更改
  const handleSaveModules = () => {
    const updatedTransformations = transformations.map(trans => {
      const module = modules.find(m => m.id === trans.key);
      if (module) {
        return {
          ...trans,
          prompt: module.prompt,
          // 如果模块被禁用，我们可以从列表中移除它，或者添加一个标记
        };
      }
      return trans;
    });
    
    // 过滤掉被禁用的模块
    const activeTransformations = updatedTransformations.filter(trans => {
      const module = modules.find(m => m.id === trans.key);
      return module?.isActive;
    });
    
    onUpdateTransformations(activeTransformations);
    onClose();
  };

  // 更新模块提示词
  const handleUpdatePrompt = () => {
    if (selectedModule) {
      setModules(prev => prev.map(module => 
        module.id === selectedModule.id 
          ? { ...module, prompt: customPrompt }
          : module
      ));
      setSelectedModule(null);
      setCustomPrompt('');
    }
  };

  // 选择模块进行编辑
  const handleSelectModule = (module: Module) => {
    setSelectedModule(module);
    setCustomPrompt(module.prompt);
  };

  // 切换模块激活状态
  const handleToggleModule = (moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isActive: !module.isActive }
        : module
    ));
  };

  // 重置所有模块到默认状态
  const handleResetToDefault = () => {
    const defaultModules: Module[] = transformations.map(trans => ({
      id: trans.key,
      name: t(trans.titleKey),
      prompt: trans.prompt || '',
      isActive: true,
      category: trans.items ? 'category' : 'effect'
    }));
    setModules(defaultModules);
    setSelectedModule(null);
    setCustomPrompt('');
  };

  // 过滤模块
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || module.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // 获取所有类别
  const categories = ['all', ...new Set(modules.map(module => module.category))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-fast">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-card)] rounded-xl border border-[var(--border-primary)] shadow-2xl p-6 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--accent-primary)]">{t('moduleManager.title')}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[rgba(107,114,128,0.2)] hover:text-[var(--text-primary)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
          {/* 左侧：模块列表 */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={t('moduleManager.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-colors placeholder-[var(--text-tertiary)]"
              />
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? t('moduleManager.categoryAll') : 
                     category === 'viral' ? t('moduleManager.categoryViral') :
                     category === 'photo' ? t('moduleManager.categoryPhoto') :
                     category === 'design' ? t('moduleManager.categoryDesign') :
                     category === 'custom' ? t('moduleManager.categoryCustom') : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
              <div className="space-y-2">
                {filteredModules.map(module => (
                  <div 
                    key={module.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedModule?.id === module.id 
                        ? 'border-[var(--accent-primary)] bg-[rgba(var(--accent-primary-rgb),0.1)]' 
                        : 'border-[var(--border-primary)] hover:border-[var(--accent-primary)]'
                    }`}
                    onClick={() => handleSelectModule(module)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)]">{module.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            module.category === 'category' 
                              ? 'bg-blue-500/20 text-blue-500' 
                              : 'bg-purple-500/20 text-purple-500'
                          }`}>
                            {module.category === 'category' ? t('moduleManager.categoryCustom') : t('moduleManager.categoryViral')}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                          {module.prompt || t('moduleManager.promptPlaceholder')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleModule(module.id);
                        }}
                        className={`ml-2 p-1 rounded-full ${
                          module.isActive 
                            ? 'text-green-500 hover:bg-green-500/20' 
                            : 'text-gray-500 hover:bg-gray-500/20'
                        }`}
                      >
                        {module.isActive ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：编辑模块 */}
          <div className="w-full md:w-1/2 flex flex-col">
            {selectedModule ? (
              <div className="flex-grow flex flex-col">
                <h3 className="text-lg font-semibold text-[var(--accent-primary)] mb-4">
                  {t('moduleManager.editPrompt')}: {selectedModule.name}
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    {t('moduleManager.editPrompt')}
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={10}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-colors placeholder-[var(--text-tertiary)]"
                    placeholder={t('moduleManager.promptPlaceholder')}
                  />
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {t('moduleManager.promptPlaceholder')}
                  </p>
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={handleUpdatePrompt}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[var(--text-on-accent)] font-semibold rounded-lg shadow-lg shadow-[var(--accent-shadow)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-secondary-hover)] transition-all duration-200"
                  >
                    {t('moduleManager.save')}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModule(null);
                      setCustomPrompt('');
                    }}
                    className="py-2 px-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    {t('moduleManager.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-[var(--text-tertiary)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p>{t('moduleManager.noModulesFound')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleResetToDefault}
            className="py-2 px-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            {t('moduleManager.resetToDefault')}
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            >
              {t('moduleManager.cancel')}
            </button>
            <button
              onClick={handleSaveModules}
              className="py-2 px-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[var(--text-on-accent)] font-semibold rounded-lg shadow-lg shadow-[var(--accent-shadow)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-secondary-hover)] transition-all duration-200"
            >
              {t('moduleManager.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleManager;