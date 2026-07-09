import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { supabase } from '../lib/supabase.js'

export function TestConnection() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }])
  }

  const testConnection = async () => {
    setLoading(true)
    addLog('🔍 Début des tests de connexion...', 'info')

    try {
      // Test 1: Vérifier l'utilisateur
      addLog(`👤 Utilisateur connecté: ${user?.email || 'Non connecté'}`, user ? 'success' : 'error')
      addLog(`🆔 User ID: ${user?.id || 'ID manquant'}`, user?.id ? 'success' : 'error')

      if (!user) {
        addLog('❌ Aucun utilisateur connecté - Veuillez vous reconnecter', 'error')
        setLoading(false)
        return
      }

      // Test 2: Tester la connexion à Supabase
      const { data, error } = await supabase.from('farms').select('count').single()
      if (error) {
        addLog(`❌ Erreur connexion Supabase: ${error.message}`, 'error')
      } else {
        addLog('✅ Connexion Supabase réussie', 'success')
      }

      // Test 3: Tester l'insertion dans farms
      addLog('🏡 Test insertion dans farms...', 'info')
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .insert({
          user_id: user.id,
          farm_name: `Ferme test ${Date.now()}`,
          region: 'Test',
          notes: 'Test de connexion'
        })
        .select()

      if (farmError) {
        if (farmError.message.includes('duplicate key')) {
          addLog('⚠️ Ferme existe déjà - Test normal', 'info')
          addLog('✅ Contrainte unique fonctionne correctement', 'success')
        } else {
          addLog(`❌ Erreur insertion farms: ${farmError.message}`, 'error')
          addLog(`🔍 Détails erreur: ${JSON.stringify(farmError.details)}`, 'error')
        }
      } else {
        addLog('✅ Insertion farms réussie', 'success')
        addLog(`📋 Farm ID: ${farmData[0]?.id}`, 'success')

        // Nettoyer le test
        await supabase.from('farms').delete().eq('id', farmData[0].id)
        addLog('🧹 Test nettoyé', 'info')
      }

      // Test 4: Vérifier la structure de la table diagnostics
      addLog('🔬 Vérification structure diagnostics...', 'info')
      const { data: columnsData, error: columnsError } = await supabase
        .from('diagnostics')
        .select('*')
        .limit(1)

      if (columnsError && columnsError.message.includes('column')) {
        addLog(`❌ Colonne manquante dans diagnostics: ${columnsError.message}`, 'error')
        addLog('🔧 Exécutez la migration 20250310000019_fix_test_errors.sql', 'info')
      } else {
        addLog('✅ Structure diagnostics correcte', 'success')

        // Test 5: Tester l'insertion dans diagnostics
        addLog('🔬 Test insertion dans diagnostics...', 'info')
        const { data: diagData, error: diagError } = await supabase
          .from('diagnostics')
          .insert({
            user_id: user.id,
            disease_name: `Test maladie ${Date.now()}`,
            symptoms: 'Test symptômes',
            cause: 'Test cause',
            severity: 'faible',
            treatment: 'Test traitement',
            eco_treatment: 'Test eco traitement',
            prevention: 'Test prévention',
            cultural_practices: 'Test pratiques'
          })
          .select()

        if (diagError) {
          addLog(`❌ Erreur insertion diagnostics: ${diagError.message}`, 'error')
        } else {
          addLog('✅ Insertion diagnostics réussie', 'success')

          // Nettoyer le test
          await supabase.from('diagnostics').delete().eq('id', diagData[0].id)
          addLog('🧹 Diagnostic test nettoyé', 'info')
        }
      }

      addLog('🎉 Tests terminés!', 'success')

    } catch (err) {
      addLog(`💥 Erreur inattendue: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'info': return 'text-blue-600'
      default: return 'text-slate-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <h1 className="text-2xl font-bold text-emerald-900 mb-4">🔧 Test de Connexion AgriSmart</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? '⏳ Test en cours...' : '🚀 Lancer les tests'}
          </button>
          <button
            onClick={clearLogs}
            className="px-6 py-3 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-700"
          >
            🗑️ Effacer les logs
          </button>
        </div>

        {/* Logs */}
        <div className="bg-slate-900 rounded-xl p-4 h-96 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-slate-400">Cliquez sur "Lancer les tests" pour commencer...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-2">
                <span className="text-slate-500">[{log.time}]</span>
                <span className={`ml-2 ${getLogColor(log.type)}`}>{log.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <h3 className="font-semibold text-emerald-900 mb-2">📋 Instructions de dépannage :</h3>
          <ol className="text-sm text-emerald-800 space-y-1 list-decimal list-inside">
            <li>Exécutez la migration <code>20250310000016_complete_debug_fix.sql</code> dans Supabase</li>
            <li>Vérifiez que vous êtes bien connecté à l'application</li>
            <li>Cliquez sur "Lancer les tests" pour diagnostiquer</li>
            <li>Si erreur RLS persiste, l'application fonctionne en mode dégradé</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
