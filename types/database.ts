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
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          gst_number?: string | null;
          pan_number?: string | null;
          financial_year_start?: number;
          default_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          gst_number?: string | null;
          pan_number?: string | null;
          financial_year_start?: number;
          default_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Insert: {
          id: string;
          company_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: string;
          department?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          role?: string;
          department?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          type?: string;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          type?: string;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          payment_terms?: string | null;
          quality_standard?: string | null;
          default_currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          payment_terms?: string | null;
          quality_standard?: string | null;
          default_currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "buyers_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          material_types?: string[];
          payment_terms?: string | null;
          avg_lead_time_days?: number;
          gst_number?: string | null;
          bank_details?: Json | null;
          rating?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          material_types?: string[];
          payment_terms?: string | null;
          avg_lead_time_days?: number;
          gst_number?: string | null;
          bank_details?: Json | null;
          rating?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          pantone_ref?: string | null;
          hex_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          pantone_ref?: string | null;
          hex_code?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "colors_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sizes_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          fabric_type?: string;
          construction?: string | null;
          gsm?: number | null;
          width_cm?: number | null;
          weave_type?: string | null;
          composition?: string | null;
          uom?: string;
          rate?: number;
          supplier_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          fabric_type?: string;
          construction?: string | null;
          gsm?: number | null;
          width_cm?: number | null;
          weave_type?: string | null;
          composition?: string | null;
          uom?: string;
          rate?: number;
          supplier_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fabrics_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fabrics_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          trim_type: string;
          description?: string | null;
          uom?: string;
          rate?: number;
          supplier_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          trim_type?: string;
          description?: string | null;
          uom?: string;
          rate?: number;
          supplier_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trims_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trims_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          chemical_type: string;
          uom?: string;
          rate?: number;
          supplier_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          chemical_type?: string;
          uom?: string;
          rate?: number;
          supplier_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chemicals_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chemicals_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          style_code: string;
          category?: string;
          description?: string | null;
          buyer_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          style_code?: string;
          category?: string;
          description?: string | null;
          buyer_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "buyers";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          machine_code: string;
          machine_type: string;
          department: string;
          location_id?: string | null;
          make?: string | null;
          model?: string | null;
          serial_number?: string | null;
          capacity_per_hour?: number | null;
          status?: string;
          purchase_date?: string | null;
          last_serviced_at?: string | null;
          next_service_due?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          machine_code?: string;
          machine_type?: string;
          department?: string;
          location_id?: string | null;
          make?: string | null;
          model?: string | null;
          serial_number?: string | null;
          capacity_per_hour?: number | null;
          status?: string;
          purchase_date?: string | null;
          last_serviced_at?: string | null;
          next_service_due?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "machines_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "machines_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          employee_code: string;
          full_name: string;
          department: string;
          designation?: string | null;
          phone?: string | null;
          email?: string | null;
          date_of_joining?: string | null;
          skill_grade?: string | null;
          skills?: string[];
          current_shift?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          employee_code?: string;
          full_name?: string;
          department?: string;
          designation?: string | null;
          phone?: string | null;
          email?: string | null;
          date_of_joining?: string | null;
          skill_grade?: string | null;
          skills?: string[];
          current_shift?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          department?: string;
          smv?: number;
          machine_type?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          code?: string;
          department?: string;
          smv?: number;
          machine_type?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "operations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          inquiry_number: string;
          buyer_id: string;
          product_id?: string | null;
          product_name?: string | null;
          expected_quantity?: number;
          target_price?: number | null;
          currency?: string;
          expected_delivery_date?: string | null;
          notes?: string | null;
          status?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          inquiry_number?: string;
          buyer_id?: string;
          product_id?: string | null;
          product_name?: string | null;
          expected_quantity?: number;
          target_price?: number | null;
          currency?: string;
          expected_delivery_date?: string | null;
          notes?: string | null;
          status?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "buyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          order_number: string;
          buyer_id: string;
          product_id?: string | null;
          product_name: string;
          order_date?: string;
          delivery_date: string;
          payment_terms?: string | null;
          fob_price?: number;
          currency?: string;
          total_quantity?: number;
          total_value?: number;
          color_size_matrix?: Json;
          status?: string;
          special_instructions?: string | null;
          bom_id?: string | null;
          inquiry_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          order_number?: string;
          buyer_id?: string;
          product_id?: string | null;
          product_name?: string;
          order_date?: string;
          delivery_date?: string;
          payment_terms?: string | null;
          fob_price?: number;
          currency?: string;
          total_quantity?: number;
          total_value?: number;
          color_size_matrix?: Json;
          status?: string;
          special_instructions?: string | null;
          bom_id?: string | null;
          inquiry_id?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_orders_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "buyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_orders_inquiry_id_fkey";
            columns: ["inquiry_id"];
            isOneToOne: false;
            referencedRelation: "inquiries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_orders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          order_id: string;
          field_name: string;
          old_value?: string | null;
          new_value?: string | null;
          reason?: string | null;
          changed_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          field_name?: string;
          old_value?: string | null;
          new_value?: string | null;
          reason?: string | null;
          changed_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_amendments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_amendments_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          sample_number: string;
          buyer_id: string;
          product_id?: string | null;
          order_id?: string | null;
          sample_type?: string;
          colors?: string[];
          quantity?: number;
          required_date?: string | null;
          submitted_date?: string | null;
          approved_date?: string | null;
          special_instructions?: string | null;
          status?: string;
          rejection_comments?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          sample_number?: string;
          buyer_id?: string;
          product_id?: string | null;
          order_id?: string | null;
          sample_type?: string;
          colors?: string[];
          quantity?: number;
          required_date?: string | null;
          submitted_date?: string | null;
          approved_date?: string | null;
          special_instructions?: string | null;
          status?: string;
          rejection_comments?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "samples_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "buyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "samples_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          recipe_number: string;
          name: string;
          shade_name: string;
          pantone_ref?: string | null;
          buyer_id?: string | null;
          version?: number;
          status?: string;
          temperature?: number | null;
          time_minutes?: number | null;
          ph_level?: number | null;
          liquor_ratio?: string | null;
          cost_per_kg?: number;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          recipe_number?: string;
          name?: string;
          shade_name?: string;
          pantone_ref?: string | null;
          buyer_id?: string | null;
          version?: number;
          status?: string;
          temperature?: number | null;
          time_minutes?: number | null;
          ph_level?: number | null;
          liquor_ratio?: string | null;
          cost_per_kg?: number;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipes_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "buyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          recipe_id: string;
          chemical_id: string;
          quantity_grams_per_kg: number;
          percentage: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          chemical_id?: string;
          quantity_grams_per_kg?: number;
          percentage?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_ingredients_chemical_id_fkey";
            columns: ["chemical_id"];
            isOneToOne: false;
            referencedRelation: "chemicals";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          lab_dip_number: string;
          order_id?: string | null;
          buyer_id: string;
          color_id?: string | null;
          color_name: string;
          recipe_id?: string | null;
          status?: string;
          submission_date?: string | null;
          approval_date?: string | null;
          rejection_comments?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          lab_dip_number?: string;
          order_id?: string | null;
          buyer_id?: string;
          color_id?: string | null;
          color_name?: string;
          recipe_id?: string | null;
          status?: string;
          submission_date?: string | null;
          approval_date?: string | null;
          rejection_comments?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lab_dips_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lab_dips_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lab_dips_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "buyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lab_dips_color_id_fkey";
            columns: ["color_id"];
            isOneToOne: false;
            referencedRelation: "colors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lab_dips_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lab_dips_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          product_id: string;
          version?: number;
          status?: string;
          total_cost?: number;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          product_id?: string;
          version?: number;
          status?: string;
          total_cost?: number;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "boms_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "boms_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "boms_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          bom_id: string;
          item_type?: string;
          item_id: string;
          item_name: string;
          quantity_per_piece?: number;
          uom?: string;
          rate?: number;
          wastage_percent?: number;
          size_wise_consumption?: Json | null;
          notes?: string | null;
          amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          bom_id?: string;
          item_type?: string;
          item_id?: string;
          item_name?: string;
          quantity_per_piece?: number;
          uom?: string;
          rate?: number;
          wastage_percent?: number;
          size_wise_consumption?: Json | null;
          notes?: string | null;
          amount?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bom_items_bom_id_fkey";
            columns: ["bom_id"];
            isOneToOne: false;
            referencedRelation: "boms";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          po_number: string;
          supplier_id: string;
          order_id?: string | null;
          indent_id?: string | null;
          expected_delivery_date: string;
          payment_terms?: string | null;
          subtotal?: number;
          tax_percent?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          po_number?: string;
          supplier_id?: string;
          order_id?: string | null;
          indent_id?: string | null;
          expected_delivery_date?: string;
          payment_terms?: string | null;
          subtotal?: number;
          tax_percent?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_indent_id_fkey";
            columns: ["indent_id"];
            isOneToOne: false;
            referencedRelation: "material_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      material_requests: {
        Row: {
          id: string;
          company_id: string;
          request_number: string;
          order_id: string | null;
          requested_by: string;
          department: string | null;
          priority: string;
          required_date: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          request_number: string;
          order_id?: string | null;
          requested_by: string;
          department?: string | null;
          priority?: string;
          required_date?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          request_number?: string;
          order_id?: string | null;
          requested_by?: string;
          department?: string | null;
          priority?: string;
          required_date?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "material_requests_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "material_requests_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "material_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          po_id: string;
          item_type: string;
          item_id: string;
          item_name: string;
          quantity: number;
          received_quantity?: number;
          uom: string;
          rate: number;
          amount: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          po_id?: string;
          item_type?: string;
          item_id?: string;
          item_name?: string;
          quantity?: number;
          received_quantity?: number;
          uom?: string;
          rate?: number;
          amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "po_items_po_id_fkey";
            columns: ["po_id"];
            isOneToOne: false;
            referencedRelation: "purchase_orders";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          grn_number: string;
          po_id: string;
          supplier_id: string;
          received_date?: string;
          vehicle_number?: string | null;
          challan_number?: string | null;
          status?: string;
          received_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          grn_number?: string;
          po_id?: string;
          supplier_id?: string;
          received_date?: string;
          vehicle_number?: string | null;
          challan_number?: string | null;
          status?: string;
          received_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "grns_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grns_po_id_fkey";
            columns: ["po_id"];
            isOneToOne: false;
            referencedRelation: "purchase_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grns_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grns_received_by_fkey";
            columns: ["received_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          grn_id: string;
          po_item_id?: string | null;
          item_type: string;
          item_id: string;
          item_name: string;
          expected_quantity: number;
          received_quantity: number;
          accepted_quantity?: number;
          rejected_quantity?: number;
          uom: string;
          batch_number?: string | null;
          stock_status?: string;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          grn_id?: string;
          po_item_id?: string | null;
          item_type?: string;
          item_id?: string;
          item_name?: string;
          expected_quantity?: number;
          received_quantity?: number;
          accepted_quantity?: number;
          rejected_quantity?: number;
          uom?: string;
          batch_number?: string | null;
          stock_status?: string;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "grn_items_grn_id_fkey";
            columns: ["grn_id"];
            isOneToOne: false;
            referencedRelation: "grns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grn_items_po_item_id_fkey";
            columns: ["po_item_id"];
            isOneToOne: false;
            referencedRelation: "po_items";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          item_type: string;
          item_id: string;
          item_name: string;
          warehouse_id?: string | null;
          batch_number?: string | null;
          dye_lot?: string | null;
          quantity?: number;
          reserved_quantity?: number;
          uom: string;
          rate?: number;
          status?: string;
          reorder_level?: number | null;
          grn_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          item_type?: string;
          item_id?: string;
          item_name?: string;
          warehouse_id?: string | null;
          batch_number?: string | null;
          dye_lot?: string | null;
          quantity?: number;
          reserved_quantity?: number;
          uom?: string;
          rate?: number;
          status?: string;
          reorder_level?: number | null;
          grn_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_warehouse_id_fkey";
            columns: ["warehouse_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_grn_id_fkey";
            columns: ["grn_id"];
            isOneToOne: false;
            referencedRelation: "grns";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          wo_number: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          bom_id?: string | null;
          total_quantity?: number;
          good_output?: number;
          defective_output?: number;
          status?: string;
          planned_start_date?: string | null;
          planned_end_date?: string | null;
          actual_start_date?: string | null;
          actual_end_date?: string | null;
          production_line?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          wo_number?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          bom_id?: string | null;
          total_quantity?: number;
          good_output?: number;
          defective_output?: number;
          status?: string;
          planned_start_date?: string | null;
          planned_end_date?: string | null;
          actual_start_date?: string | null;
          actual_end_date?: string | null;
          production_line?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_orders_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_orders_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_orders_bom_id_fkey";
            columns: ["bom_id"];
            isOneToOne: false;
            referencedRelation: "boms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_orders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          work_order_id: string;
          order_id: string;
          entry_date?: string;
          shift?: string;
          production_line: string;
          hour_slot?: string | null;
          operation_id?: string | null;
          target_quantity?: number;
          produced_quantity?: number;
          defective_quantity?: number;
          rework_quantity?: number;
          operators_present?: number;
          working_minutes?: number;
          efficiency_percent?: number;
          notes?: string | null;
          entered_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          work_order_id?: string;
          order_id?: string;
          entry_date?: string;
          shift?: string;
          production_line?: string;
          hour_slot?: string | null;
          operation_id?: string | null;
          target_quantity?: number;
          produced_quantity?: number;
          defective_quantity?: number;
          rework_quantity?: number;
          operators_present?: number;
          working_minutes?: number;
          efficiency_percent?: number;
          notes?: string | null;
          entered_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "production_entries_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "production_entries_work_order_id_fkey";
            columns: ["work_order_id"];
            isOneToOne: false;
            referencedRelation: "work_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "production_entries_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "production_entries_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "production_entries_entered_by_fkey";
            columns: ["entered_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          department?: string;
          total_operators?: number;
          current_order_id?: string | null;
          current_work_order_id?: string | null;
          target_per_hour?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          department?: string;
          total_operators?: number;
          current_order_id?: string | null;
          current_work_order_id?: string | null;
          target_per_hour?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "production_lines_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "production_lines_current_order_id_fkey";
            columns: ["current_order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          work_order_id: string;
          entry_date?: string;
          marker_length?: number | null;
          marker_efficiency?: number | null;
          layers?: number | null;
          fabric_rolls_used?: string | null;
          fabric_consumed: number;
          planned_consumption?: number | null;
          wastage_percent?: number;
          size_breakdown?: Json;
          total_cut_qty?: number;
          bundles_created?: number;
          entered_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          work_order_id?: string;
          entry_date?: string;
          marker_length?: number | null;
          marker_efficiency?: number | null;
          layers?: number | null;
          fabric_rolls_used?: string | null;
          fabric_consumed?: number;
          planned_consumption?: number | null;
          wastage_percent?: number;
          size_breakdown?: Json;
          total_cut_qty?: number;
          bundles_created?: number;
          entered_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cutting_entries_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cutting_entries_work_order_id_fkey";
            columns: ["work_order_id"];
            isOneToOne: false;
            referencedRelation: "work_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cutting_entries_entered_by_fkey";
            columns: ["entered_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          inspection_number: string;
          inspection_type: string;
          order_id?: string | null;
          work_order_id?: string | null;
          production_line?: string | null;
          template_id?: string | null;
          inspector_id?: string | null;
          inspection_date?: string;
          lot_size?: number;
          sample_size?: number;
          pieces_checked?: number;
          total_defects?: number;
          critical_defects?: number;
          major_defects?: number;
          minor_defects?: number;
          aql_level?: string | null;
          result?: string;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          inspection_number?: string;
          inspection_type?: string;
          order_id?: string | null;
          work_order_id?: string | null;
          production_line?: string | null;
          template_id?: string | null;
          inspector_id?: string | null;
          inspection_date?: string;
          lot_size?: number;
          sample_size?: number;
          pieces_checked?: number;
          total_defects?: number;
          critical_defects?: number;
          major_defects?: number;
          minor_defects?: number;
          aql_level?: string | null;
          result?: string;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inspections_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inspections_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inspections_work_order_id_fkey";
            columns: ["work_order_id"];
            isOneToOne: false;
            referencedRelation: "work_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inspections_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "inspection_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inspections_inspector_id_fkey";
            columns: ["inspector_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inspections_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          inspection_id: string;
          defect_type: string;
          defect_location?: string | null;
          severity?: string;
          quantity?: number;
          photo_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          inspection_id?: string;
          defect_type?: string;
          defect_location?: string | null;
          severity?: string;
          quantity?: number;
          photo_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inspection_defects_inspection_id_fkey";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "inspections";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          capa_number: string;
          inspection_id?: string | null;
          defect_description: string;
          root_cause?: string | null;
          corrective_action?: string | null;
          preventive_action?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          status?: string;
          verified_by?: string | null;
          verified_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          capa_number?: string;
          inspection_id?: string | null;
          defect_description?: string;
          root_cause?: string | null;
          corrective_action?: string | null;
          preventive_action?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          status?: string;
          verified_by?: string | null;
          verified_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "capas_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "capas_inspection_id_fkey";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "inspections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "capas_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "capas_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "capas_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          batch_number: string;
          order_id?: string | null;
          color_id?: string | null;
          color_name: string;
          recipe_id?: string | null;
          input_quantity_kg: number;
          output_quantity_kg?: number | null;
          process_loss_percent?: number | null;
          shade_result?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          batch_number?: string;
          order_id?: string | null;
          color_id?: string | null;
          color_name?: string;
          recipe_id?: string | null;
          input_quantity_kg?: number;
          output_quantity_kg?: number | null;
          process_loss_percent?: number | null;
          shade_result?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dyeing_batches_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dyeing_batches_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dyeing_batches_color_id_fkey";
            columns: ["color_id"];
            isOneToOne: false;
            referencedRelation: "colors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dyeing_batches_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dyeing_batches_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          shipment_number: string;
          order_ids?: string[];
          buyer_id: string;
          planned_shipment_date: string;
          actual_shipment_date?: string | null;
          port_of_loading?: string | null;
          port_of_discharge?: string | null;
          container_number?: string | null;
          container_type?: string | null;
          seal_number?: string | null;
          vessel_name?: string | null;
          voyage_number?: string | null;
          etd?: string | null;
          eta?: string | null;
          total_cartons?: number;
          total_pieces?: number;
          status?: string;
          production_complete?: boolean;
          qc_passed?: boolean;
          packing_done?: boolean;
          documents_ready?: boolean;
          transport_arranged?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          shipment_number?: string;
          order_ids?: string[];
          buyer_id?: string;
          planned_shipment_date?: string;
          actual_shipment_date?: string | null;
          port_of_loading?: string | null;
          port_of_discharge?: string | null;
          container_number?: string | null;
          container_type?: string | null;
          seal_number?: string | null;
          vessel_name?: string | null;
          voyage_number?: string | null;
          etd?: string | null;
          eta?: string | null;
          total_cartons?: number;
          total_pieces?: number;
          status?: string;
          production_complete?: boolean;
          qc_passed?: boolean;
          packing_done?: boolean;
          documents_ready?: boolean;
          transport_arranged?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "buyers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shipments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tna_templates_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          order_id: string;
          template_id?: string | null;
          milestone_name: string;
          planned_date: string;
          actual_date?: string | null;
          responsible_department?: string | null;
          status?: string;
          delay_days?: number;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          template_id?: string | null;
          milestone_name?: string;
          planned_date?: string;
          actual_date?: string | null;
          responsible_department?: string | null;
          status?: string;
          delay_days?: number;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tna_milestones_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tna_milestones_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "tna_templates";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          cs_number: string;
          product_id?: string | null;
          order_id?: string | null;
          version?: number;
          version_name?: string | null;
          status?: string;
          material_cost?: number;
          cutting_cost?: number;
          sewing_cost?: number;
          finishing_cost?: number;
          dyeing_cost?: number;
          overhead_cost?: number;
          admin_overhead?: number;
          testing_charges?: number;
          packing_cost?: number;
          transport_cost?: number;
          rejection_percent?: number;
          commission_percent?: number;
          profit_percent?: number;
          base_cost?: number;
          total_cost?: number;
          fob_price?: number;
          currency?: string;
          exchange_rate?: number;
          fob_price_usd?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          cs_number?: string;
          product_id?: string | null;
          order_id?: string | null;
          version?: number;
          version_name?: string | null;
          status?: string;
          material_cost?: number;
          cutting_cost?: number;
          sewing_cost?: number;
          finishing_cost?: number;
          dyeing_cost?: number;
          overhead_cost?: number;
          admin_overhead?: number;
          testing_charges?: number;
          packing_cost?: number;
          transport_cost?: number;
          rejection_percent?: number;
          commission_percent?: number;
          profit_percent?: number;
          base_cost?: number;
          total_cost?: number;
          fob_price?: number;
          currency?: string;
          exchange_rate?: number;
          fob_price_usd?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cost_sheets_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cost_sheets_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cost_sheets_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cost_sheets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          entity_type: string;
          entity_id: string;
          content: string;
          author_id: string;
          mentioned_users?: string[];
          attachments?: Json[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          entity_type?: string;
          entity_id?: string;
          content?: string;
          author_id?: string;
          mentioned_users?: string[];
          attachments?: Json[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id?: string | null;
          table_name: string;
          record_id: string;
          action: string;
          old_data?: Json | null;
          new_data?: Json | null;
          user_id?: string | null;
          user_email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          table_name?: string;
          record_id?: string;
          action?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          user_id?: string | null;
          user_email?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          document_type: string;
          prefix: string;
          current_sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          document_type?: string;
          prefix?: string;
          current_sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "number_series_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          company_id: string;
          roll_number: string;
          fabric_id: string;
          grn_id?: string | null;
          supplier_id?: string | null;
          width_cm?: number | null;
          length_meters: number;
          weight_kg?: number | null;
          dye_lot?: string | null;
          batch_number?: string | null;
          grade?: string;
          defect_points?: number;
          warehouse_id?: string | null;
          status?: string;
          order_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          roll_number?: string;
          fabric_id?: string;
          grn_id?: string | null;
          supplier_id?: string | null;
          width_cm?: number | null;
          length_meters?: number;
          weight_kg?: number | null;
          dye_lot?: string | null;
          batch_number?: string | null;
          grade?: string;
          defect_points?: number;
          warehouse_id?: string | null;
          status?: string;
          order_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fabric_rolls_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fabric_rolls_fabric_id_fkey";
            columns: ["fabric_id"];
            isOneToOne: false;
            referencedRelation: "fabrics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fabric_rolls_grn_id_fkey";
            columns: ["grn_id"];
            isOneToOne: false;
            referencedRelation: "grns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fabric_rolls_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fabric_rolls_warehouse_id_fkey";
            columns: ["warehouse_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fabric_rolls_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "sales_orders";
            referencedColumns: ["id"];
          }
        ];
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
