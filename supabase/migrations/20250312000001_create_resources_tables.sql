-- Tables pour la gestion des ressources agricoles

-- Table pour le suivi d'irrigation
CREATE TABLE irrigation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  parcel_name VARCHAR(255) NOT NULL,
  irrigation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  water_volume_m3 DECIMAL(10,2) NOT NULL, -- Volume en mètres cubes
  irrigation_duration_minutes INTEGER, -- Durée en minutes
  irrigation_method VARCHAR(100), -- Goutte-à-goutte, aspersion, pivot, etc.
  weather_conditions VARCHAR(255), -- Conditions météo lors de l'irrigation
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les engrais et produits fertilisants
CREATE TABLE fertilizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(100) NOT NULL, -- Organique, minéral, liquide, granulé
  npk_ratio VARCHAR(20), -- Ratio N-P-K (ex: "15-15-15")
  manufacturer VARCHAR(255),
  purchase_date DATE,
  quantity_available DECIMAL(10,2), -- Quantité disponible (kg ou L)
  unit VARCHAR(20), -- kg, L, tonne
  cost_per_unit DECIMAL(10,2),
  safety_data_sheet TEXT, -- Lien vers fiche de données de sécurité
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les produits phytosanitaires
CREATE TABLE phyto_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(100) NOT NULL, -- Herbicide, fongicide, insecticide, etc.
  active_ingredient VARCHAR(255), -- Substance active
  concentration VARCHAR(50), -- Concentration de la substance active
  manufacturer VARCHAR(255),
  approval_number VARCHAR(100), -- Numéro d'homologation
  purchase_date DATE,
  quantity_available DECIMAL(10,2), -- Quantité disponible (L ou kg)
  unit VARCHAR(20), -- L, kg
  cost_per_unit DECIMAL(10,2),
  safety_data_sheet TEXT, -- Lien vers fiche de données de sécurité
  reentry_interval_days INTEGER, -- Délai de réentrée
  harvest_interval_days INTEGER, -- Délai avant récolte
  max_applications_per_year INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour le planning des interventions culturales
CREATE TABLE cultural_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  intervention_type VARCHAR(100) NOT NULL, -- Plantation, récolte, traitement, irrigation, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_parcel VARCHAR(255),
  target_crop VARCHAR(255),
  planned_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  estimated_duration_hours DECIMAL(4,1),
  required_equipment TEXT[], -- Équipements nécessaires
  required_labor INTEGER, -- Nombre de personnes nécessaires
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour la traçabilité des traitements appliqués
CREATE TABLE treatment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  intervention_id UUID REFERENCES cultural_interventions(id) ON DELETE SET NULL,
  treatment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  treatment_type VARCHAR(100) NOT NULL, -- Fertilisation, phytosanitaire, biostimulant
  product_id UUID, -- Référence au produit utilisé (fertilizer ou phyto_product)
  product_name VARCHAR(255) NOT NULL,
  application_method VARCHAR(100), -- Pulvérisation, épandage, irrigation ferti, etc.
  dose_applied DECIMAL(10,2) NOT NULL, -- Dose appliquée
  dose_unit VARCHAR(20) NOT NULL, -- L/ha, kg/ha, etc.
  treated_area DECIMAL(10,2) NOT NULL, -- Surface traitée (ha)
  weather_conditions VARCHAR(255),
  operator_name VARCHAR(255),
  equipment_used VARCHAR(255),
  observations TEXT,
  efficacy_rating INTEGER CHECK (efficacy_rating >= 1 AND efficacy_rating <= 5), -- Note d'efficacité
  phytotoxicity_observed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les stocks d'eau
CREATE TABLE water_reservoirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  reservoir_name VARCHAR(255) NOT NULL,
  reservoir_type VARCHAR(100), -- Bassin, citerne, forage, rivière, etc.
  capacity_m3 DECIMAL(10,2) NOT NULL, -- Capacité totale
  current_volume_m3 DECIMAL(10,2), -- Volume actuel
  unit VARCHAR(20) DEFAULT 'm3',
  location_description TEXT,
  gps_lat DECIMAL(10,8),
  gps_lng DECIMAL(11,8),
  water_quality VARCHAR(100), -- Bonne, moyenne, médiocre
  last_refill_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE irrigation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE phyto_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_reservoirs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour irrigation_records
CREATE POLICY "Users can view their own irrigation records" ON irrigation_records FOR SELECT USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can insert their own irrigation records" ON irrigation_records FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can update their own irrigation records" ON irrigation_records FOR UPDATE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can delete their own irrigation records" ON irrigation_records FOR DELETE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));

-- Politiques RLS pour fertilizers
CREATE POLICY "Users can view their own fertilizers" ON fertilizers FOR SELECT USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can insert their own fertilizers" ON fertilizers FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can update their own fertilizers" ON fertilizers FOR UPDATE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can delete their own fertilizers" ON fertilizers FOR DELETE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));

-- Politiques RLS pour phyto_products
CREATE POLICY "Users can view their own phyto products" ON phyto_products FOR SELECT USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can insert their own phyto products" ON phyto_products FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can update their own phyto products" ON phyto_products FOR UPDATE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can delete their own phyto products" ON phyto_products FOR DELETE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));

-- Politiques RLS pour cultural_interventions
CREATE POLICY "Users can view their own cultural interventions" ON cultural_interventions FOR SELECT USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can insert their own cultural interventions" ON cultural_interventions FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can update their own cultural interventions" ON cultural_interventions FOR UPDATE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can delete their own cultural interventions" ON cultural_interventions FOR DELETE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));

-- Politiques RLS pour treatment_applications
CREATE POLICY "Users can view their own treatment applications" ON treatment_applications FOR SELECT USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can insert their own treatment applications" ON treatment_applications FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can update their own treatment applications" ON treatment_applications FOR UPDATE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can delete their own treatment applications" ON treatment_applications FOR DELETE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));

-- Politiques RLS pour water_reservoirs
CREATE POLICY "Users can view their own water reservoirs" ON water_reservoirs FOR SELECT USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can insert their own water reservoirs" ON water_reservoirs FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can update their own water reservoirs" ON water_reservoirs FOR UPDATE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));
CREATE POLICY "Users can delete their own water reservoirs" ON water_reservoirs FOR DELETE USING (auth.uid() = (SELECT user_id FROM farms WHERE id = farm_id));

-- Index pour optimiser les performances
CREATE INDEX idx_irrigation_records_farm_date ON irrigation_records(farm_id, irrigation_date);
CREATE INDEX idx_fertilizers_farm_type ON fertilizers(farm_id, product_type);
CREATE INDEX idx_phyto_products_farm_type ON phyto_products(farm_id, product_type);
CREATE INDEX idx_cultural_interventions_farm_date ON cultural_interventions(farm_id, planned_date);
CREATE INDEX idx_treatment_applications_farm_date ON treatment_applications(farm_id, treatment_date);
CREATE INDEX idx_water_reservoirs_farm ON water_reservoirs(farm_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_irrigation_records_updated_at BEFORE UPDATE ON irrigation_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fertilizers_updated_at BEFORE UPDATE ON fertilizers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_phyto_products_updated_at BEFORE UPDATE ON phyto_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cultural_interventions_updated_at BEFORE UPDATE ON cultural_interventions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_applications_updated_at BEFORE UPDATE ON treatment_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_water_reservoirs_updated_at BEFORE UPDATE ON water_reservoirs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
