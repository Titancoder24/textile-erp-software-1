import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  DEMO_COMPANY_ID,
  DEMO_USERS,
  DEMO_BUYERS,
  DEMO_SUPPLIERS,
  DEMO_COLORS,
  DEMO_SIZES,
  DEMO_FABRICS,
  DEMO_PRODUCTS,
  DEMO_PRODUCTION_LINES,
  DEMO_NUMBER_SERIES,
} from "@/lib/seed/demo-data";

// Create admin client lazily to avoid build-time errors when env vars are missing
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST() {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // 1. Create demo company
    const { error: companyError } = await supabaseAdmin
      .from("companies")
      .upsert(
        {
          id: DEMO_COMPANY_ID,
          name: "TextileOS Demo Factory",
          city: "Tirupur",
          state: "Tamil Nadu",
          country: "India",
          phone: "+91-421-2345678",
          email: "info@demo.textile-os.com",
          gst_number: "33AADCD1234F1ZA",
          default_currency: "INR",
          is_demo: true,
        },
        { onConflict: "id" }
      );

    if (companyError) {
      return NextResponse.json(
        { error: "Failed to create company: " + companyError.message },
        { status: 500 }
      );
    }

    // 2. Create demo users
    const userProfiles = [];
    for (const user of DEMO_USERS) {
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

      if (authError && !authError.message.includes("already been registered")) {
        console.error(`Failed to create user ${user.email}:`, authError.message);
        continue;
      }

      const userId = authUser?.user?.id;
      if (userId) {
        userProfiles.push({
          id: userId,
          company_id: DEMO_COMPANY_ID,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          department: user.department,
          is_active: true,
        });
      }
    }

    if (userProfiles.length > 0) {
      await supabaseAdmin.from("profiles").upsert(userProfiles, { onConflict: "id" });
    }

    // 3. Seed number series
    const numberSeries = DEMO_NUMBER_SERIES.map((ns) => ({
      company_id: DEMO_COMPANY_ID,
      document_type: ns.document_type,
      prefix: ns.prefix,
      current_sequence: Math.floor(Math.random() * 20) + 40,
    }));
    await supabaseAdmin.from("number_series").upsert(numberSeries, {
      onConflict: "company_id,document_type",
    });

    // 4. Seed buyers
    const buyers = DEMO_BUYERS.map((b) => ({
      company_id: DEMO_COMPANY_ID,
      ...b,
      is_active: true,
    }));
    const { data: insertedBuyers } = await supabaseAdmin
      .from("buyers")
      .upsert(buyers, { onConflict: "company_id,code" })
      .select();

    // 5. Seed suppliers
    const suppliers = DEMO_SUPPLIERS.map((s) => ({
      company_id: DEMO_COMPANY_ID,
      ...s,
      is_active: true,
    }));
    const { data: insertedSuppliers } = await supabaseAdmin
      .from("suppliers")
      .upsert(suppliers, { onConflict: "company_id,code" })
      .select();

    // 6. Seed colors
    const colors = DEMO_COLORS.map((c) => ({
      company_id: DEMO_COMPANY_ID,
      ...c,
    }));
    const { data: insertedColors } = await supabaseAdmin
      .from("colors")
      .upsert(colors, { onConflict: "company_id,code" })
      .select();

    // 7. Seed sizes
    const sizes = DEMO_SIZES.map((s) => ({
      company_id: DEMO_COMPANY_ID,
      ...s,
    }));
    await supabaseAdmin
      .from("sizes")
      .upsert(sizes, { onConflict: "company_id,code" });

    // 8. Seed fabrics
    const fabrics = DEMO_FABRICS.map((f) => ({
      company_id: DEMO_COMPANY_ID,
      ...f,
      supplier_id: insertedSuppliers?.[0]?.id || null,
      is_active: true,
    }));
    const { data: insertedFabrics } = await supabaseAdmin
      .from("fabrics")
      .upsert(fabrics, { onConflict: "company_id,code" })
      .select();

    // 9. Seed products
    const products = DEMO_PRODUCTS.map((p, i) => ({
      company_id: DEMO_COMPANY_ID,
      ...p,
      buyer_id:
        insertedBuyers && insertedBuyers.length > 0
          ? insertedBuyers[i % insertedBuyers.length].id
          : null,
      is_active: true,
    }));
    const { data: insertedProducts } = await supabaseAdmin
      .from("products")
      .upsert(products, { onConflict: "company_id,style_code" })
      .select();

    // 10. Seed production lines
    const lines = DEMO_PRODUCTION_LINES.map((l) => ({
      company_id: DEMO_COMPANY_ID,
      ...l,
      is_active: true,
    }));
    const { data: insertedLines } = await supabaseAdmin
      .from("production_lines")
      .upsert(lines)
      .select();

    // 11. Create sample sales orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let insertedOrders: any[] | null = null;
    if (insertedBuyers && insertedProducts && userProfiles.length > 0) {
      const creatorId = userProfiles[0].id;
      const now = new Date();

      const orders = [
        {
          company_id: DEMO_COMPANY_ID,
          order_number: "SO-2026-0041",
          buyer_id: insertedBuyers[0].id,
          product_id: insertedProducts[0].id,
          product_name: insertedProducts[0].name,
          order_date: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
          delivery_date: new Date(now.getTime() + 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
          fob_price: 1.95,
          currency: "USD",
          total_quantity: 2350,
          total_value: 4582.5,
          status: "in_production",
          payment_terms: "TT 60 Days",
          color_size_matrix: JSON.stringify([
            { color: "Red", sizes: { S: 200, M: 400, L: 300, XL: 100 } },
            { color: "Blue", sizes: { S: 150, M: 350, L: 250, XL: 100 } },
            { color: "Black", sizes: { S: 100, M: 200, L: 150, XL: 50 } },
          ]),
          created_by: creatorId,
        },
        {
          company_id: DEMO_COMPANY_ID,
          order_number: "SO-2026-0042",
          buyer_id: insertedBuyers[1].id,
          product_id: insertedProducts[2].id,
          product_name: insertedProducts[2].name,
          order_date: new Date(now.getTime() - 20 * 24 * 3600 * 1000).toISOString().split("T")[0],
          delivery_date: new Date(now.getTime() + 25 * 24 * 3600 * 1000).toISOString().split("T")[0],
          fob_price: 3.25,
          currency: "EUR",
          total_quantity: 5000,
          total_value: 16250,
          status: "material_sourcing",
          payment_terms: "LC 45 Days",
          color_size_matrix: JSON.stringify([
            { color: "Navy Blue", sizes: { S: 500, M: 1200, L: 1000, XL: 500, XXL: 300 } },
            { color: "White", sizes: { S: 300, M: 500, L: 400, XL: 200, XXL: 100 } },
          ]),
          created_by: creatorId,
        },
        {
          company_id: DEMO_COMPANY_ID,
          order_number: "SO-2026-0043",
          buyer_id: insertedBuyers[2].id,
          product_id: insertedProducts[4].id,
          product_name: insertedProducts[4].name,
          order_date: new Date(now.getTime() - 45 * 24 * 3600 * 1000).toISOString().split("T")[0],
          delivery_date: new Date(now.getTime() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
          fob_price: 4.50,
          currency: "USD",
          total_quantity: 3000,
          total_value: 13500,
          status: "in_production",
          payment_terms: "TT 45 Days",
          color_size_matrix: JSON.stringify([
            { color: "Khaki", sizes: { "28": 300, "30": 600, "32": 800, "34": 700, "36": 400, "38": 200 } },
          ]),
          created_by: creatorId,
        },
        {
          company_id: DEMO_COMPANY_ID,
          order_number: "SO-2026-0044",
          buyer_id: insertedBuyers[3].id,
          product_id: insertedProducts[5].id,
          product_name: insertedProducts[5].name,
          order_date: new Date(now.getTime() - 10 * 24 * 3600 * 1000).toISOString().split("T")[0],
          delivery_date: new Date(now.getTime() + 35 * 24 * 3600 * 1000).toISOString().split("T")[0],
          fob_price: 5.80,
          currency: "GBP",
          total_quantity: 4000,
          total_value: 23200,
          status: "confirmed",
          payment_terms: "TT 30 Days",
          color_size_matrix: JSON.stringify([
            { color: "Charcoal Grey", sizes: { S: 400, M: 800, L: 800, XL: 600, XXL: 400 } },
            { color: "Forest Green", sizes: { S: 200, M: 400, L: 400, XL: 300, XXL: 100 } },
          ]),
          created_by: creatorId,
        },
        {
          company_id: DEMO_COMPANY_ID,
          order_number: "SO-2026-0045",
          buyer_id: insertedBuyers[4].id,
          product_id: insertedProducts[1].id,
          product_name: insertedProducts[1].name,
          order_date: new Date(now.getTime() - 50 * 24 * 3600 * 1000).toISOString().split("T")[0],
          delivery_date: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
          fob_price: 1.75,
          currency: "GBP",
          total_quantity: 8000,
          total_value: 14000,
          status: "ready_to_ship",
          payment_terms: "TT 60 Days",
          color_size_matrix: JSON.stringify([
            { color: "Black", sizes: { S: 800, M: 2000, L: 2000, XL: 1200 } },
            { color: "White", sizes: { S: 400, M: 800, L: 600, XL: 200 } },
          ]),
          created_by: creatorId,
        },
      ];

      const { data: ordersData } = await supabaseAdmin
        .from("sales_orders")
        .upsert(orders, { onConflict: "company_id,order_number" })
        .select();
      insertedOrders = ordersData;

      // 12. Create work orders for production orders
      if (insertedOrders && insertedLines) {
        const workOrders = insertedOrders
          .filter((o) => ["in_production", "ready_to_ship"].includes(o.status))
          .map((order, i) => ({
            company_id: DEMO_COMPANY_ID,
            wo_number: `WO-2026-00${41 + i}`,
            order_id: order.id,
            product_name: order.product_name,
            total_quantity: order.total_quantity,
            good_output: Math.floor(order.total_quantity * (order.status === "ready_to_ship" ? 0.98 : 0.62)),
            defective_output: Math.floor(order.total_quantity * 0.02),
            status: order.status === "ready_to_ship" ? "completed" : "sewing",
            planned_start_date: order.order_date,
            production_line: insertedLines[i % insertedLines.length].name,
            created_by: creatorId,
          }));

        await supabaseAdmin
          .from("work_orders")
          .upsert(workOrders, { onConflict: "company_id,wo_number" });
      }

      // 13. Assign orders to production lines
      if (insertedOrders && insertedLines) {
        for (let i = 0; i < Math.min(insertedOrders.length, insertedLines.length); i++) {
          if (["in_production"].includes(insertedOrders[i].status)) {
            await supabaseAdmin
              .from("production_lines")
              .update({ current_order_id: insertedOrders[i].id })
              .eq("id", insertedLines[i].id);
          }
        }
      }
    }

    // 14. Create demo employees (batch)
    const departments = [
      "Sewing", "Sewing", "Sewing", "Sewing", "Cutting", "Cutting",
      "Finishing", "Finishing", "Quality", "Quality", "Store", "Dyeing",
      "Merchandising", "HR", "Maintenance", "Accounts",
    ];
    const grades = ["A", "A", "B", "B", "B", "C", "C", "Trainee"];
    const shifts = ["morning", "morning", "morning", "evening", "evening", "night"];
    const employees = [];

    for (let i = 1; i <= 200; i++) {
      employees.push({
        company_id: DEMO_COMPANY_ID,
        employee_code: `EMP-${String(i).padStart(4, "0")}`,
        full_name: `Employee ${i}`,
        department: departments[i % departments.length],
        designation: i <= 16 ? "Supervisor" : i <= 50 ? "Senior Operator" : "Operator",
        skill_grade: grades[i % grades.length],
        current_shift: shifts[i % shifts.length],
        is_active: i <= 185,
      });
    }

    await supabaseAdmin.from("employees").upsert(employees, {
      onConflict: "company_id,employee_code",
    });

    // 15. Seed production entries for last 30 days
    // Need a work_order_id — use the first inserted work order if available
    if (insertedLines && insertedLines.length > 0) {
      // Fetch work orders we just created
      const { data: fetchedWOs } = await supabaseAdmin
        .from("work_orders")
        .select("id, order_id")
        .eq("company_id", DEMO_COMPANY_ID)
        .limit(10);

      if (fetchedWOs && fetchedWOs.length > 0) {
        const productionEntries = [];
        const now = new Date();
        for (let day = 30; day >= 1; day--) {
          const dateStr = new Date(now.getTime() - day * 24 * 3600 * 1000)
            .toISOString()
            .split("T")[0];
          for (let li = 0; li < Math.min(5, insertedLines.length); li++) {
            const line = insertedLines[li];
            const wo = fetchedWOs[li % fetchedWOs.length];
            const targetQty = line.target_per_hour * 8;
            const efficiency = 0.70 + Math.random() * 0.25;
            const produced = Math.floor(targetQty * efficiency);
            const defects = Math.floor(produced * (0.01 + Math.random() * 0.03));
            productionEntries.push({
              company_id: DEMO_COMPANY_ID,
              work_order_id: wo.id,
              order_id: wo.order_id,
              entry_date: dateStr,
              shift: "morning",
              production_line: line.name,
              target_quantity: targetQty,
              produced_quantity: produced,
              defective_quantity: defects,
              operators_present: line.total_operators,
              efficiency_percent: Math.round(efficiency * 100),
              working_minutes: 480,
              entered_by: userProfiles[0].id,
            });
          }
        }
        // Insert in batches (no unique constraint on these cols, use insert)
        for (let i = 0; i < productionEntries.length; i += 50) {
          await supabaseAdmin
            .from("production_entries")
            .insert(productionEntries.slice(i, i + 50));
        }
      }
    }

    // 16. Quality inspections (mix of pass/fail)
    if (insertedOrders && insertedOrders.length > 0 && userProfiles.length > 0) {
      const inspectorId = userProfiles[userProfiles.length > 3 ? 3 : 0].id;
      const inspections = [];
      const types = ["inline", "endline", "pre_final", "final"];
      for (let i = 0; i < 12; i++) {
        const order = insertedOrders[i % insertedOrders.length];
        const lotSize = Math.floor(500 + Math.random() * 1500);
        const sampleSize = Math.floor(lotSize * 0.1);
        const totalDefects = Math.floor(sampleSize * (0.02 + Math.random() * 0.1));
        const majorDefects = Math.floor(totalDefects * 0.6);
        const minorDefects = totalDefects - majorDefects;
        const passRate = 1 - totalDefects / sampleSize;
        inspections.push({
          company_id: DEMO_COMPANY_ID,
          inspection_number: `QC-2026-${String(70 + i).padStart(4, "0")}`,
          order_id: order.id,
          inspection_type: types[i % types.length],
          inspection_date: new Date(Date.now() - i * 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
          lot_size: lotSize,
          sample_size: sampleSize,
          pieces_checked: sampleSize,
          total_defects: totalDefects,
          major_defects: majorDefects,
          minor_defects: minorDefects,
          critical_defects: 0,
          aql_level: "AQL 2.5",
          result: passRate >= 0.97 ? "pass" : passRate >= 0.92 ? "conditional_pass" : "fail",
          inspector_id: inspectorId,
          created_by: inspectorId,
        });
      }
      await supabaseAdmin
        .from("inspections")
        .upsert(inspections, { onConflict: "company_id,inspection_number" });
    }

    // 17. Dyeing batches
    if (insertedOrders && insertedOrders.length > 0 && userProfiles.length > 0) {
      // Fetch inserted colors for reference
      const { data: fetchedColors } = await supabaseAdmin
        .from("colors")
        .select("id, name")
        .eq("company_id", DEMO_COMPANY_ID)
        .limit(10);

      const dyeingBatches = [
        {
          company_id: DEMO_COMPANY_ID,
          batch_number: "DYE-2026-0031",
          order_id: insertedOrders[0]?.id || null,
          color_id: fetchedColors?.find((c) => c.name === "Navy Blue")?.id || null,
          color_name: "Navy Blue",
          input_quantity_kg: 500,
          output_quantity_kg: 490,
          process_loss_percent: 2.0,
          shade_result: "approved",
          status: "completed",
          start_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
          end_date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split("T")[0],
          created_by: userProfiles[0].id,
        },
        {
          company_id: DEMO_COMPANY_ID,
          batch_number: "DYE-2026-0032",
          order_id: insertedOrders[1]?.id || null,
          color_id: fetchedColors?.find((c) => c.name === "Red")?.id || null,
          color_name: "Red",
          input_quantity_kg: 350,
          status: "in_process",
          start_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split("T")[0],
          created_by: userProfiles[0].id,
        },
        {
          company_id: DEMO_COMPANY_ID,
          batch_number: "DYE-2026-0033",
          order_id: insertedOrders[2]?.id || null,
          color_id: fetchedColors?.find((c) => c.name === "Olive Green")?.id || null,
          color_name: "Olive Green",
          input_quantity_kg: 420,
          status: "planned",
          start_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split("T")[0],
          created_by: userProfiles[0].id,
        },
      ];
      await supabaseAdmin
        .from("dyeing_batches")
        .upsert(dyeingBatches, { onConflict: "company_id,batch_number" });
    }

    // 18. Shipments
    if (insertedOrders && insertedOrders.length > 0) {
      const readyOrder = insertedOrders.find((o) => o.status === "ready_to_ship");
      const inProdOrder = insertedOrders.find((o) => o.status === "in_production");
      const shipments = [
        {
          company_id: DEMO_COMPANY_ID,
          shipment_number: "SH-2026-0008",
          order_ids: readyOrder ? [readyOrder.id] : [],
          buyer_id: readyOrder?.buyer_id || insertedOrders[0].buyer_id,
          planned_shipment_date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split("T")[0],
          status: "packing",
          port_of_loading: "Tuticorin",
          port_of_discharge: "Hamburg",
          vessel_name: "MSC AURORA",
          container_type: "20ft",
          total_cartons: 120,
          total_pieces: 8000,
          production_complete: true,
          qc_passed: true,
          packing_done: false,
          documents_ready: false,
          transport_arranged: false,
          created_by: userProfiles[0].id,
        },
        {
          company_id: DEMO_COMPANY_ID,
          shipment_number: "SH-2026-0007",
          order_ids: inProdOrder ? [inProdOrder.id] : [],
          buyer_id: inProdOrder?.buyer_id || insertedOrders[0].buyer_id,
          planned_shipment_date: new Date(Date.now() + 18 * 24 * 3600 * 1000).toISOString().split("T")[0],
          status: "packing",
          port_of_loading: "Chennai",
          port_of_discharge: "Barcelona",
          container_type: "40ft",
          total_cartons: 0,
          total_pieces: 0,
          production_complete: false,
          qc_passed: false,
          packing_done: false,
          documents_ready: false,
          transport_arranged: false,
          created_by: userProfiles[0].id,
        },
      ];
      await supabaseAdmin
        .from("shipments")
        .upsert(shipments, { onConflict: "company_id,shipment_number" });
    }

    // 19. TNA milestones
    if (insertedOrders && insertedOrders.length > 0) {
      const milestones = [];
      const milestoneTypes = [
        { name: "PP Meeting", offsetDays: -45, dept: "Merchandising" },
        { name: "Fabric Booking", offsetDays: -42, dept: "Purchase" },
        { name: "Fabric In-house", offsetDays: -30, dept: "Store" },
        { name: "Cutting Start", offsetDays: -25, dept: "Cutting" },
        { name: "Sewing Start", offsetDays: -20, dept: "Sewing" },
        { name: "Finishing Complete", offsetDays: -8, dept: "Finishing" },
        { name: "Final Inspection", offsetDays: -5, dept: "Quality" },
        { name: "Ex-factory", offsetDays: 0, dept: "Shipping" },
      ];
      for (const order of insertedOrders.slice(0, 3)) {
        const shipDate = new Date(order.delivery_date);
        for (let si = 0; si < milestoneTypes.length; si++) {
          const ms = milestoneTypes[si];
          const plannedDate = new Date(shipDate.getTime() + ms.offsetDays * 24 * 3600 * 1000);
          const isPast = plannedDate < new Date();
          milestones.push({
            company_id: DEMO_COMPANY_ID,
            order_id: order.id,
            milestone_name: ms.name,
            planned_date: plannedDate.toISOString().split("T")[0],
            actual_date: isPast && Math.random() > 0.2 ? plannedDate.toISOString().split("T")[0] : null,
            status: isPast ? "completed" : "pending",
            responsible_department: ms.dept,
            sort_order: si,
          });
        }
      }
      await supabaseAdmin.from("tna_milestones").insert(milestones);
    }

    // 20. Lab dips and samples
    if (insertedOrders && insertedBuyers && insertedOrders.length > 0 && userProfiles.length > 0) {
      const creatorId = userProfiles[2]?.id || userProfiles[0].id;
      const labDips = [];
      const samples = [];
      for (let oi = 0; oi < Math.min(3, insertedOrders.length); oi++) {
        const order = insertedOrders[oi];
        const buyer = insertedBuyers[oi % insertedBuyers.length];
        labDips.push({
          company_id: DEMO_COMPANY_ID,
          lab_dip_number: `LD-2026-${String(25 + oi + 1).padStart(4, "0")}`,
          order_id: order.id,
          buyer_id: buyer.id,
          color_name: "Navy Blue",
          status: "approved",
          submission_date: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString().split("T")[0],
          approval_date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split("T")[0],
          created_by: creatorId,
        });
        samples.push({
          company_id: DEMO_COMPANY_ID,
          sample_number: `SA-2026-${String(40 + oi + 1).padStart(4, "0")}`,
          order_id: order.id,
          buyer_id: buyer.id,
          sample_type: "pre_production",
          status: "approved",
          submitted_date: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString().split("T")[0],
          approved_date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString().split("T")[0],
          quantity: 3,
          created_by: creatorId,
        });
      }
      await supabaseAdmin
        .from("lab_dips")
        .upsert(labDips, { onConflict: "company_id,lab_dip_number" });
      await supabaseAdmin
        .from("samples")
        .upsert(samples, { onConflict: "company_id,sample_number" });
    }

    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully",
      credentials: DEMO_USERS.map((u) => ({
        role: u.role,
        email: u.email,
        password: u.password,
      })),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed demo data: " + (error as Error).message },
      { status: 500 }
    );
  }
}
