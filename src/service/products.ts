import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "./api";
import { useAuthStore } from "../store/auth";
import type {
  CreateProductPayload,
  Product,
  ProductListResponse,
  ProductResponse,
  UpdateProductPayload,
} from "../types/products";

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? fallback;
}

function extractProduct(payload: Product | ProductResponse) {
  if ("id" in payload) {
    return payload;
  }

  return payload.data ?? payload.product;
}

function getActiveCompanyId(companyId?: string) {
  return companyId ?? useAuthStore.getState().company?.id;
}

export function useProducts(
  companyId?: string,
  limit = 10,
  page = 1,
  query = "",
  categoryId?: string | null
) {
  const resolvedCompanyId = getActiveCompanyId(companyId);

  return useQuery({
    queryKey: ["products", resolvedCompanyId, limit, page, query, categoryId ?? ""],
    queryFn: async () => {
      try {
        const { data } = await api.get<ProductListResponse>(
          `/api/v1/company/${resolvedCompanyId}/products`,
          {
            params: {
              limit,
              page,
              query,
              category_id: categoryId || undefined,
            },
          }
        );

        return {
          products: data.data?.products ?? [],
          count: data.data?.count ?? 0,
        };
      } catch (error) {
        throw new Error(getErrorMessage(error, "Failed to load products."));
      }
    },
    enabled: Boolean(resolvedCompanyId),
    refetchOnWindowFocus: false,
  });
}

export function useProductById(companyId?: string, id?: string) {
  const queryClient = useQueryClient();
  const resolvedCompanyId = getActiveCompanyId(companyId);

  return useQuery({
    queryKey: ["product", resolvedCompanyId, id],
    queryFn: async () => {
      try {
        const { data } = await api.get<Product | ProductResponse>(
          `/api/v1/company/${resolvedCompanyId}/product/${id}`
        );
        const product = extractProduct(data);

        if (!product) {
          throw new Error("Product not found.");
        }

        return product;
      } catch (error) {
        throw new Error(getErrorMessage(error, "Failed to load the product."));
      }
    },
    enabled: Boolean(resolvedCompanyId && id),
    refetchOnWindowFocus: false,
    initialData: () => {
      if (!id) {
        return undefined;
      }

      const cachedQueries = queryClient.getQueriesData<{
        products: Product[];
        count: number;
      }>({
        queryKey: ["products"],
      });

      for (const [, value] of cachedQueries) {
        const found = value?.products.find((product) => product.id === id);

        if (found) {
          return found;
        }
      }

      return undefined;
    },
  });
}

export const useCreateProduct = () =>
  useMutation<Product, Error, CreateProductPayload>({
    mutationFn: async (payload) => {
      const companyId = getActiveCompanyId(payload.company_id);

      if (!companyId) {
        throw new Error("Company id is required.");
      }

      try {
        const { data } = await api.post<Product | ProductResponse>(
          `/api/v1/company/${companyId}/product`,
          {
            ...payload,
            company_id: companyId,
          }
        );
        const product = extractProduct(data);

        if (!product) {
          throw new Error("Product not found.");
        }

        return product;
      } catch (error) {
        throw new Error(getErrorMessage(error, "Failed to create product."));
      }
    },
  });

export const useUpdateProduct = () =>
  useMutation<Product, Error, { id: string; payload: UpdateProductPayload }>({
    mutationFn: async ({ id, payload }) => {
      const companyId = getActiveCompanyId(payload.company_id);

      if (!companyId) {
        throw new Error("Company id is required.");
      }

      try {
        const { data } = await api.put<Product | ProductResponse>(
          `/api/v1/company/product/${id}`,
          {
            ...payload,
            company_id: companyId,
          }
        );
        const product = extractProduct(data);

        if (!product) {
          throw new Error("Product not found.");
        }

        return product;
      } catch (error) {
        throw new Error(getErrorMessage(error, "Failed to update product."));
      }
    },
  });

export const useDeleteProduct = () =>
  useMutation<void, Error, string>({
    mutationFn: async (id) => {
      try {
        await api.delete(`/api/v1/company/product/${id}`);
      } catch (error) {
        throw new Error(getErrorMessage(error, "Failed to delete product."));
      }
    },
  });
