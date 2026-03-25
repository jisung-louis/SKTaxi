import {httpClient, type ApiSuccessResponse} from '@/shared/api';

import type {
  BoardBookmarkResponseDto,
  BoardCommentDto,
  BoardCreateCommentRequestDto,
  BoardCreatePostRequestDto,
  BoardImageUploadResponseDto,
  BoardLikeResponseDto,
  BoardPageResponseDto,
  BoardPostDetailDto,
  BoardPostSummaryDto,
  BoardPostCategoryDto,
  BoardUpdateCommentRequestDto,
  BoardUpdatePostRequestDto,
} from '../dto/boardDto';

interface GetPostsParams {
  category?: BoardPostCategoryDto;
  search?: string;
  authorId?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export class BoardApiClient {
  createPost(data: BoardCreatePostRequestDto) {
    return httpClient.post<ApiSuccessResponse<BoardPostDetailDto>, BoardCreatePostRequestDto>(
      '/v1/posts',
      data,
    );
  }

  deletePost(postId: string) {
    return httpClient.delete<ApiSuccessResponse<null>>(`/v1/posts/${postId}`);
  }

  getComments(postId: string) {
    return httpClient.get<ApiSuccessResponse<BoardCommentDto[]>>(
      `/v1/posts/${postId}/comments`,
    );
  }

  getPost(postId: string) {
    return httpClient.get<ApiSuccessResponse<BoardPostDetailDto>>(
      `/v1/posts/${postId}`,
    );
  }

  getPosts(params: GetPostsParams) {
    return httpClient.get<
      ApiSuccessResponse<BoardPageResponseDto<BoardPostSummaryDto>>
    >('/v1/posts', {
      params,
    });
  }

  bookmarkPost(postId: string) {
    return httpClient.post<ApiSuccessResponse<BoardBookmarkResponseDto>>(
      `/v1/posts/${postId}/bookmark`,
    );
  }

  createComment(postId: string, data: BoardCreateCommentRequestDto) {
    return httpClient.post<
      ApiSuccessResponse<BoardCommentDto>,
      BoardCreateCommentRequestDto
    >(`/v1/posts/${postId}/comments`, data);
  }

  likePost(postId: string) {
    return httpClient.post<ApiSuccessResponse<BoardLikeResponseDto>>(
      `/v1/posts/${postId}/like`,
    );
  }

  unlikePost(postId: string) {
    return httpClient.delete<ApiSuccessResponse<BoardLikeResponseDto>>(
      `/v1/posts/${postId}/like`,
    );
  }

  unbookmarkPost(postId: string) {
    return httpClient.delete<ApiSuccessResponse<BoardBookmarkResponseDto>>(
      `/v1/posts/${postId}/bookmark`,
    );
  }

  updateComment(commentId: string, data: BoardUpdateCommentRequestDto) {
    return httpClient.patch<
      ApiSuccessResponse<BoardCommentDto>,
      BoardUpdateCommentRequestDto
    >(`/v1/comments/${commentId}`, data);
  }

  deleteComment(commentId: string) {
    return httpClient.delete<ApiSuccessResponse<null>>(`/v1/comments/${commentId}`);
  }

  updatePost(postId: string, data: BoardUpdatePostRequestDto) {
    return httpClient.patch<
      ApiSuccessResponse<BoardPostDetailDto>,
      BoardUpdatePostRequestDto
    >(`/v1/posts/${postId}`, data);
  }

  uploadPostImage(
    uri: string,
    {
      fileName,
      mimeType,
    }: {
      fileName?: string;
      mimeType?: string;
    } = {},
  ) {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName ?? uri.split('/').pop() ?? `board-image-${Date.now()}.jpg`,
      type: mimeType ?? 'image/jpeg',
    } as any);

    return httpClient.request<ApiSuccessResponse<BoardImageUploadResponseDto>, FormData>({
      method: 'POST',
      url: '/v1/images',
      params: {
        context: 'POST_IMAGE',
      },
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const boardApiClient = new BoardApiClient();
