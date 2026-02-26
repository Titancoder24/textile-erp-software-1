export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          gst_number: string | null;
          pan_number: string | null;
          financial_year_start: number;
          default_currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["companies"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["companies"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: string;
          department: string | null;
          avatar_url: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["profiles"]["Row"],
              "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      locations: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          type: string;
          address: string | null;
          city: string | null;
          country: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["locations"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["locations"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
      };
      buyers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          payment_terms: string | null;
          quality_standard: string | null;
          default_currency: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["buyers"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["buyers"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["buyers"]["Insert"]>;
      };
      suppliers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          material_types: string[];
          payment_terms: string | null;
          avg_lead_time_days: number;
          gst_number: string | null;
          bank_details: Json | null;
          rating: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["suppliers"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["suppliers"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Insert"]>;
      };
      colors: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          pantone_ref: string | null;
          hex_code: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["colors"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["colors"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["colors"]["Insert"]>;
      };
      sizes: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["sizes"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["sizes"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["sizes"]["Insert"]>;
      };
      fabrics: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          fabric_type: string;
          construction: string | null;
          gsm: number | null;
          width_cm: number | null;
          weave_type: string | null;
          composition: string | null;
          uom: string;
          rate: number;
          supplier_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["fabrics"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["fabrics"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["fabrics"]["Insert"]>;
      };
      trims: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          trim_type: string;
          description: string | null;
          uom: string;
          rate: number;
          supplier_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["trims"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["trims"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["trims"]["Insert"]>;
      };
      chemicals: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          chemical_type: string;
          uom: string;
          rate: number;
          supplier_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["chemicals"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["chemicals"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["chemicals"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          style_code: string;
          category: string;
          description: string | null;
          buyer_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["products"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      machines: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          machine_code: string;
          machine_type: string;
          department: string;
          location_id: string | null;
          make: string | null;
          model: string | null;
          serial_number: string | null;
          capacity_per_hour: number | null;
          status: string;
          purchase_date: string | null;
          last_serviced_at: string | null;
          next_service_due: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["machines"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["machines"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["machines"]["Insert"]>;
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          employee_code: string;
          full_name: string;
          department: string;
          designation: string | null;
          phone: string | null;
          email: string | null;
          date_of_joining: string | null;
          skill_grade: string | null;
          skills: string[];
          current_shift: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["employees"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["employees"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      operations: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          department: string;
          smv: number;
          machine_type: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["operations"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["operations"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["operations"]["Insert"]>;
      };
      inquiries: {
        Row: {
          id: string;
          company_id: string;
          inquiry_number: string;
          buyer_id: string;
          product_id: string | null;
          product_name: string | null;
          expected_quantity: number;
          target_price: number | null;
          currency: string;
          expected_delivery_date: string | null;
          notes: string | null;
          status: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["inquiries"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["inquiries"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
      };
      sales_orders: {
        Row: {
          id: string;
          company_id: string;
          order_number: string;
          buyer_id: string;
          product_id: string | null;
          product_name: string;
          order_date: string;
          delivery_date: string;
          payment_terms: string | null;
          fob_price: number;
          currency: string;
          total_quantity: number;
          total_value: number;
          color_size_matrix: Json;
          status: string;
          special_instructions: string | null;
          bom_id: string | null;
          inquiry_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["sales_orders"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["sales_orders"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["sales_orders"]["Insert"]>;
      };
      order_amendments: {
        Row: {
          id: string;
          order_id: string;
          field_name: string;
          old_value: string | null;
          new_value: string | null;
          reason: string | null;
          changed_by: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["order_amendments"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["order_amendments"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["order_amendments"]["Insert"]
        >;
      };
      samples: {
        Row: {
          id: string;
          company_id: string;
          sample_number: string;
          buyer_id: string;
          product_id: string | null;
          order_id: string | null;
          sample_type: string;
          colors: string[];
          quantity: number;
          required_date: string | null;
          submitted_date: string | null;
          approved_date: string | null;
          special_instructions: string | null;
          status: string;
          rejection_comments: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["samples"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["samples"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["samples"]["Insert"]>;
      };
      recipes: {
        Row: {
          id: string;
          company_id: string;
          recipe_number: string;
          name: string;
          shade_name: string;
          pantone_ref: string | null;
          buyer_id: string | null;
          version: number;
          status: string;
          temperature: number | null;
          time_minutes: number | null;
          ph_level: number | null;
          liquor_ratio: string | null;
          cost_per_kg: number;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["recipes"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["recipes"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["recipes"]["Insert"]>;
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          chemical_id: string;
          quantity_grams_per_kg: number;
          percentage: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["recipe_ingredients"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["recipe_ingredients"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["recipe_ingredients"]["Insert"]
        >;
      };
      lab_dips: {
        Row: {
          id: string;
          company_id: string;
          lab_dip_number: string;
          order_id: string | null;
          buyer_id: string;
          color_id: string | null;
          color_name: string;
          recipe_id: string | null;
          status: string;
          submission_date: string | null;
          approval_date: string | null;
          rejection_comments: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["lab_dips"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["lab_dips"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["lab_dips"]["Insert"]>;
      };
      boms: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          product_id: string;
          version: number;
          status: string;
          total_cost: number;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["boms"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["boms"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["boms"]["Insert"]>;
      };
      bom_items: {
        Row: {
          id: string;
          bom_id: string;
          item_type: string;
          item_id: string;
          item_name: string;
          quantity_per_piece: number;
          uom: string;
          rate: number;
          wastage_percent: number;
          size_wise_consumption: Json | null;
          notes: string | null;
          amount: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["bom_items"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["bom_items"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["bom_items"]["Insert"]>;
      };
      purchase_orders: {
        Row: {
          id: string;
          company_id: string;
          po_number: string;
          supplier_id: string;
          order_id: string | null;
          indent_id: string | null;
          expected_delivery_date: string;
          payment_terms: string | null;
          subtotal: number;
          tax_percent: number;
          tax_amount: number;
          total_amount: number;
          currency: string;
          status: string;
          approved_by: string | null;
          approved_at: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["purchase_orders"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["purchase_orders"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["purchase_orders"]["Insert"]
        >;
      };
      po_items: {
        Row: {
          id: string;
          po_id: string;
          item_type: string;
          item_id: string;
          item_name: string;
          quantity: number;
          received_quantity: number;
          uom: string;
          rate: number;
          amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["po_items"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["po_items"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["po_items"]["Insert"]>;
      };
      grns: {
        Row: {
          id: string;
          company_id: string;
          grn_number: string;
          po_id: string;
          supplier_id: string;
          received_date: string;
          vehicle_number: string | null;
          challan_number: string | null;
          status: string;
          received_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["grns"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["grns"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["grns"]["Insert"]>;
      };
      grn_items: {
        Row: {
          id: string;
          grn_id: string;
          po_item_id: string | null;
          item_type: string;
          item_id: string;
          item_name: string;
          expected_quantity: number;
          received_quantity: number;
          accepted_quantity: number;
          rejected_quantity: number;
          uom: string;
          batch_number: string | null;
          stock_status: string;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["grn_items"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["grn_items"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["grn_items"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: string;
          company_id: string;
          item_type: string;
          item_id: string;
          item_name: string;
          warehouse_id: string | null;
          batch_number: string | null;
          dye_lot: string | null;
          quantity: number;
          reserved_quantity: number;
          uom: string;
          rate: number;
          status: string;
          reorder_level: number | null;
          grn_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["inventory"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["inventory"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      work_orders: {
        Row: {
          id: string;
          company_id: string;
          wo_number: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          bom_id: string | null;
          total_quantity: number;
          good_output: number;
          defective_output: number;
          status: string;
          planned_start_date: string | null;
          planned_end_date: string | null;
          actual_start_date: string | null;
          actual_end_date: string | null;
          production_line: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["work_orders"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["work_orders"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["work_orders"]["Insert"]>;
      };
      production_entries: {
        Row: {
          id: string;
          company_id: string;
          work_order_id: string;
          order_id: string;
          entry_date: string;
          shift: string;
          production_line: string;
          hour_slot: string | null;
          operation_id: string | null;
          target_quantity: number;
          produced_quantity: number;
          defective_quantity: number;
          rework_quantity: number;
          operators_present: number;
          working_minutes: number;
          efficiency_percent: number;
          notes: string | null;
          entered_by: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["production_entries"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["production_entries"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["production_entries"]["Insert"]
        >;
      };
      production_lines: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          department: string;
          total_operators: number;
          current_order_id: string | null;
          current_work_order_id: string | null;
          target_per_hour: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["production_lines"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["production_lines"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["production_lines"]["Insert"]
        >;
      };
      cutting_entries: {
        Row: {
          id: string;
          company_id: string;
          work_order_id: string;
          entry_date: string;
          marker_length: number | null;
          marker_efficiency: number | null;
          layers: number | null;
          fabric_rolls_used: string | null;
          fabric_consumed: number;
          planned_consumption: number | null;
          wastage_percent: number;
          size_breakdown: Json;
          total_cut_qty: number;
          bundles_created: number;
          entered_by: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["cutting_entries"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["cutting_entries"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["cutting_entries"]["Insert"]
        >;
      };
      inspections: {
        Row: {
          id: string;
          company_id: string;
          inspection_number: string;
          inspection_type: string;
          order_id: string | null;
          work_order_id: string | null;
          production_line: string | null;
          template_id: string | null;
          inspector_id: string | null;
          inspection_date: string;
          lot_size: number;
          sample_size: number;
          pieces_checked: number;
          total_defects: number;
          critical_defects: number;
          major_defects: number;
          minor_defects: number;
          aql_level: string | null;
          result: string;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["inspections"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["inspections"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["inspections"]["Insert"]>;
      };
      inspection_defects: {
        Row: {
          id: string;
          inspection_id: string;
          defect_type: string;
          defect_location: string | null;
          severity: string;
          quantity: number;
          photo_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["inspection_defects"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["inspection_defects"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["inspection_defects"]["Insert"]
        >;
      };
      capas: {
        Row: {
          id: string;
          company_id: string;
          capa_number: string;
          inspection_id: string | null;
          defect_description: string;
          root_cause: string | null;
          corrective_action: string | null;
          preventive_action: string | null;
          assigned_to: string | null;
          due_date: string | null;
          status: string;
          verified_by: string | null;
          verified_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["capas"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["capas"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["capas"]["Insert"]>;
      };
      dyeing_batches: {
        Row: {
          id: string;
          company_id: string;
          batch_number: string;
          order_id: string | null;
          color_id: string | null;
          color_name: string;
          recipe_id: string | null;
          input_quantity_kg: number;
          output_quantity_kg: number | null;
          process_loss_percent: number | null;
          shade_result: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["dyeing_batches"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["dyeing_batches"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["dyeing_batches"]["Insert"]
        >;
      };
      shipments: {
        Row: {
          id: string;
          company_id: string;
          shipment_number: string;
          order_ids: string[];
          buyer_id: string;
          planned_shipment_date: string;
          actual_shipment_date: string | null;
          port_of_loading: string | null;
          port_of_discharge: string | null;
          container_number: string | null;
          container_type: string | null;
          seal_number: string | null;
          vessel_name: string | null;
          voyage_number: string | null;
          etd: string | null;
          eta: string | null;
          total_cartons: number;
          total_pieces: number;
          status: string;
          production_complete: boolean;
          qc_passed: boolean;
          packing_done: boolean;
          documents_ready: boolean;
          transport_arranged: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["shipments"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["shipments"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["shipments"]["Insert"]>;
      };
      tna_templates: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["tna_templates"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["tna_templates"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["tna_templates"]["Insert"]
        >;
      };
      tna_milestones: {
        Row: {
          id: string;
          order_id: string;
          template_id: string | null;
          milestone_name: string;
          planned_date: string;
          actual_date: string | null;
          responsible_department: string | null;
          status: string;
          delay_days: number;
          notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["tna_milestones"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["tna_milestones"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["tna_milestones"]["Insert"]
        >;
      };
      cost_sheets: {
        Row: {
          id: string;
          company_id: string;
          cs_number: string;
          product_id: string | null;
          order_id: string | null;
          version: number;
          version_name: string | null;
          status: string;
          material_cost: number;
          cutting_cost: number;
          sewing_cost: number;
          finishing_cost: number;
          dyeing_cost: number;
          overhead_cost: number;
          admin_overhead: number;
          testing_charges: number;
          packing_cost: number;
          transport_cost: number;
          rejection_percent: number;
          commission_percent: number;
          profit_percent: number;
          base_cost: number;
          total_cost: number;
          fob_price: number;
          currency: string;
          exchange_rate: number;
          fob_price_usd: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["cost_sheets"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["cost_sheets"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["cost_sheets"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          entity_type: string | null;
          entity_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["notifications"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["notifications"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
      };
      comments: {
        Row: {
          id: string;
          company_id: string;
          entity_type: string;
          entity_id: string;
          content: string;
          author_id: string;
          mentioned_users: string[];
          attachments: Json[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["comments"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["comments"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          company_id: string | null;
          table_name: string;
          record_id: string;
          action: string;
          old_data: Json | null;
          new_data: Json | null;
          user_id: string | null;
          user_email: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["audit_logs"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["audit_logs"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: never;
      };
      number_series: {
        Row: {
          id: string;
          company_id: string;
          document_type: string;
          prefix: string;
          current_sequence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["number_series"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["number_series"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["number_series"]["Insert"]
        >;
      };
      fabric_rolls: {
        Row: {
          id: string;
          company_id: string;
          roll_number: string;
          fabric_id: string;
          grn_id: string | null;
          supplier_id: string | null;
          width_cm: number | null;
          length_meters: number;
          weight_kg: number | null;
          dye_lot: string | null;
          batch_number: string | null;
          grade: string;
          defect_points: number;
          warehouse_id: string | null;
          status: string;
          order_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["fabric_rolls"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["fabric_rolls"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["fabric_rolls"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_next_number: {
        Args: { p_company_id: string; p_document_type: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
};

// Convenience type aliases
export type Company =
  Database["public"]["Tables"]["companies"]["Row"];
export type Profile =
  Database["public"]["Tables"]["profiles"]["Row"];
export type Buyer =
  Database["public"]["Tables"]["buyers"]["Row"];
export type Supplier =
  Database["public"]["Tables"]["suppliers"]["Row"];
export type Color =
  Database["public"]["Tables"]["colors"]["Row"];
export type Size =
  Database["public"]["Tables"]["sizes"]["Row"];
export type Fabric =
  Database["public"]["Tables"]["fabrics"]["Row"];
export type Trim =
  Database["public"]["Tables"]["trims"]["Row"];
export type Chemical =
  Database["public"]["Tables"]["chemicals"]["Row"];
export type Product =
  Database["public"]["Tables"]["products"]["Row"];
export type Machine =
  Database["public"]["Tables"]["machines"]["Row"];
export type Employee =
  Database["public"]["Tables"]["employees"]["Row"];
export type Operation =
  Database["public"]["Tables"]["operations"]["Row"];
export type Inquiry =
  Database["public"]["Tables"]["inquiries"]["Row"];
export type SalesOrder =
  Database["public"]["Tables"]["sales_orders"]["Row"];
export type Sample =
  Database["public"]["Tables"]["samples"]["Row"];
export type Recipe =
  Database["public"]["Tables"]["recipes"]["Row"];
export type LabDip =
  Database["public"]["Tables"]["lab_dips"]["Row"];
export type BOM =
  Database["public"]["Tables"]["boms"]["Row"];
export type BOMItem =
  Database["public"]["Tables"]["bom_items"]["Row"];
export type PurchaseOrder =
  Database["public"]["Tables"]["purchase_orders"]["Row"];
export type GRN =
  Database["public"]["Tables"]["grns"]["Row"];
export type InventoryItem =
  Database["public"]["Tables"]["inventory"]["Row"];
export type WorkOrder =
  Database["public"]["Tables"]["work_orders"]["Row"];
export type ProductionEntry =
  Database["public"]["Tables"]["production_entries"]["Row"];
export type ProductionLine =
  Database["public"]["Tables"]["production_lines"]["Row"];
export type Inspection =
  Database["public"]["Tables"]["inspections"]["Row"];
export type CAPA =
  Database["public"]["Tables"]["capas"]["Row"];
export type DyeingBatch =
  Database["public"]["Tables"]["dyeing_batches"]["Row"];
export type Shipment =
  Database["public"]["Tables"]["shipments"]["Row"];
export type CostSheet =
  Database["public"]["Tables"]["cost_sheets"]["Row"];
export type Notification =
  Database["public"]["Tables"]["notifications"]["Row"];
export type Comment =
  Database["public"]["Tables"]["comments"]["Row"];
export type FabricRoll =
  Database["public"]["Tables"]["fabric_rolls"]["Row"];
export type TNAMilestone =
  Database["public"]["Tables"]["tna_milestones"]["Row"];
