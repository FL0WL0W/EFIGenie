#include "CommunicationHandlers/CommunicationHandler_OBD2PIDRequester.h"
#include "CommunicationHandlers/CommunicationHandler_OBD2PIDResponder.h"
#include "Operations/Operation.h"

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <array>
#include <cstring>

#include "MockCommunicationService.h"

namespace EFIGenie
{
	class BytePIDOperation : public OperationArchitecture::Operation<uint8_t>
	{
	public:
		explicit BytePIDOperation(uint8_t value) : _value(value) {}
		uint8_t Execute() override { return _value; }

	private:
		uint8_t _value;
	};

	class WordPIDOperation : public OperationArchitecture::Operation<uint16_t>
	{
	public:
		uint16_t Execute() override { return 0x1234; }
	};

	class ByteArrayPIDOperation : public OperationArchitecture::Operation<std::array<uint8_t, 4>>
	{
	public:
		std::array<uint8_t, 4> Execute() override { return {{ 0x12, 0x34, 0x56, 0x78 }}; }
	};

	TEST(CommunicationHandler_OBD2PIDTests, RegisteredPIDReturnsOperationPayload)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDResponder service(&communicationService);
		BytePIDOperation operation(0x7f);
		ASSERT_TRUE(service.RegisterPID(0x04, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 3))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x04, 0x7f };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x04 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, ScalarPayloadUsesNetworkByteOrder)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDResponder service(&communicationService);
		WordPIDOperation operation;
		ASSERT_TRUE(service.RegisterPID(0x0c, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 4))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x0c, 0x12, 0x34 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x0c };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, OtherPayloadPreservesOperationByteOrder)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDResponder service(&communicationService);
		ByteArrayPIDOperation operation;
		ASSERT_TRUE(service.RegisterPID(0x0d, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 6))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x0d, 0x12, 0x34, 0x56, 0x78 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x0d };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, UnsupportedService1PIDsAreConsumed)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDResponder service(&communicationService);
		const uint8_t unsupportedService[] = { 0x02, 0x04 };
		const uint8_t unsupportedPID[] = { 0x01, 0x05 };
		const uint8_t incompleteService1[] = { 0x01 };

		EXPECT_CALL(communicationService, Send(testing::_, testing::_)).Times(0);
		EXPECT_EQ(communicationService.Receive(unsupportedService, sizeof(unsupportedService)), 0u);
		EXPECT_EQ(communicationService.Receive(unsupportedPID, sizeof(unsupportedPID)), sizeof(unsupportedPID));
		EXPECT_EQ(communicationService.Receive(incompleteService1, sizeof(incompleteService1)), 0u);
	}

	TEST(CommunicationHandler_OBD2PIDTests, RejectsOperationsWithParameters)
	{
		class ParameterOperation : public OperationArchitecture::Operation<uint8_t, uint8_t>
		{
			uint8_t Execute(uint8_t value) override { return value; }
		} operation;

		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDResponder service(&communicationService);
		EXPECT_FALSE(service.RegisterPID(0x04, &operation));
	}

	TEST(CommunicationHandler_OBD2PIDTests, SupportedPIDRequestReturnsBitmap)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDResponder service(&communicationService);
		BytePIDOperation operation(0);
		ASSERT_TRUE(service.RegisterPID(0x01, &operation));
		ASSERT_TRUE(service.RegisterPID(0x08, &operation));
		ASSERT_TRUE(service.RegisterPID(0x1f, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 6))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x00, 0x81, 0x00, 0x00, 0x02 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x00 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_OBD2PIDTests, SupportedPIDBitmapAdvertisesNextPage)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDResponder service(&communicationService);
		BytePIDOperation operation(0);
		ASSERT_TRUE(service.RegisterPID(0x21, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 6))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x00, 0x00, 0x00, 0x00, 0x01 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x01, 0x00 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));

		EXPECT_CALL(communicationService, Send(testing::_, 6))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x41, 0x20, 0x80, 0x00, 0x00, 0x00 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t nextPageRequest[] = { 0x01, 0x20 };
		EXPECT_EQ(communicationService.Receive(nextPageRequest, sizeof(nextPageRequest)), sizeof(nextPageRequest));
	}

	TEST(CommunicationHandler_OBD2PIDTests, RequestPIDSendsService1Request)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDRequester service(&communicationService);

		EXPECT_CALL(communicationService, Send(testing::_, 2))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x01, 0x0c };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});
		EXPECT_TRUE(service.RequestPID(0x0c));
	}

	TEST(CommunicationHandler_OBD2PIDTests, MatchingService1ResponseCallsRegisteredCallback)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDRequester service(&communicationService);
		unsigned int calls = 0;
		service.RegisterReceivedPID(0x0c, [&](const void *data, size_t length) {
			++calls;
			const uint8_t expected[] = { 0x12, 0x34 };
			ASSERT_EQ(length, sizeof(expected));
			EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
		});

		const uint8_t unrelated[] = { 0x41, 0x0d, 0x55 };
		const uint8_t response[] = { 0x41, 0x0c, 0x12, 0x34 };
		EXPECT_EQ(communicationService.Receive(unrelated, sizeof(unrelated)), sizeof(unrelated));
		EXPECT_EQ(calls, 0u);
		EXPECT_EQ(communicationService.Receive(response, sizeof(response)), sizeof(response));
		EXPECT_EQ(calls, 1u);
	}

	TEST(CommunicationHandler_OBD2PIDTests, UnregisterReceivedPIDStopsCallback)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDRequester service(&communicationService);
		unsigned int calls = 0;
		const auto callbackId = service.RegisterReceivedPID(0x04, [&](const void *, size_t) { ++calls; });
		service.UnregisterReceivedPID(callbackId);

		const uint8_t response[] = { 0x41, 0x04, 0x7f };
		EXPECT_EQ(communicationService.Receive(response, sizeof(response)), sizeof(response));
		EXPECT_EQ(calls, 0u);
	}

	TEST(CommunicationHandler_OBD2PIDTests, MultipleCallbacksCanRegisterForSamePID)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDRequester service(&communicationService);
		unsigned int firstCalls = 0;
		unsigned int secondCalls = 0;
		service.RegisterReceivedPID(0x04, [&](const void *, size_t) { ++firstCalls; });
		service.RegisterReceivedPID(0x04, [&](const void *, size_t) { ++secondCalls; });

		const uint8_t response[] = { 0x41, 0x04, 0x7f };
		EXPECT_EQ(communicationService.Receive(response, sizeof(response)), sizeof(response));
		EXPECT_EQ(firstCalls, 1u);
		EXPECT_EQ(secondCalls, 1u);
	}

	TEST(CommunicationHandler_OBD2PIDTests, UnregisterReceivedPIDOnlyRemovesMatchingRegistration)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_OBD2PIDRequester service(&communicationService);
		unsigned int firstCalls = 0;
		unsigned int secondCalls = 0;
		const auto firstId = service.RegisterReceivedPID(0x04, [&](const void *, size_t) { ++firstCalls; });
		const auto secondId = service.RegisterReceivedPID(0x04, [&](const void *, size_t) { ++secondCalls; });
		EXPECT_NE(firstId, secondId);
		service.UnregisterReceivedPID(firstId);

		const uint8_t response[] = { 0x41, 0x04, 0x7f };
		EXPECT_EQ(communicationService.Receive(response, sizeof(response)), sizeof(response));
		EXPECT_EQ(firstCalls, 0u);
		EXPECT_EQ(secondCalls, 1u);
	}
}
