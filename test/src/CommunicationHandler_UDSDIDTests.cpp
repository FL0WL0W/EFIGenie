#include "CommunicationHandlers/CommunicationHandler_UDSDIDRequester.h"
#include "CommunicationHandlers/CommunicationHandler_UDSDIDResponder.h"
#include "CommunicationHandlers/CommunicationHandler_OBD2PIDResponder.h"
#include "Operations/Operation.h"

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <array>
#include <cstring>

#include "MockCommunicationService.h"

namespace EFIGenie
{
	class ByteDIDOperation : public OperationArchitecture::Operation<uint8_t>
	{
	public:
		explicit ByteDIDOperation(uint8_t value) : _value(value) {}
		uint8_t Execute() override { return _value; }

	private:
		uint8_t _value;
	};

	class WordDIDOperation : public OperationArchitecture::Operation<uint16_t>
	{
	public:
		uint16_t Execute() override { return 0x1234; }
	};

	TEST(CommunicationHandler_UDSDIDTests, Service22ReturnsRegisteredDID)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_UDSDIDResponder service(&communicationService);
		ByteDIDOperation operation(0x7f);
		ASSERT_TRUE(service.RegisterDID(0xf190, &operation));

		EXPECT_CALL(communicationService, Send(testing::_, 4))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x62, 0xf1, 0x90, 0x7f };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x22, 0xf1, 0x90 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_UDSDIDTests, Service22SupportsMultipleDIDs)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_UDSDIDResponder service(&communicationService);
		ByteDIDOperation byteOperation(0x7f);
		WordDIDOperation wordOperation;
		ASSERT_TRUE(service.RegisterDID(0xf190, &byteOperation));
		ASSERT_TRUE(service.RegisterDID(0x1234, &wordOperation));

		EXPECT_CALL(communicationService, Send(testing::_, 8))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x62, 0xf1, 0x90, 0x7f, 0x12, 0x34, 0x12, 0x34 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});

		const uint8_t request[] = { 0x22, 0xf1, 0x90, 0x12, 0x34 };
		EXPECT_EQ(communicationService.Receive(request, sizeof(request)), sizeof(request));
	}

	TEST(CommunicationHandler_UDSDIDTests, Service22RejectsUnknownAndMalformedDIDs)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_UDSDIDResponder service(&communicationService);

		EXPECT_CALL(communicationService, Send(testing::_, 3))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x7f, 0x22, 0x31 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});
		const uint8_t unknown[] = { 0x22, 0xf1, 0x90 };
		EXPECT_EQ(communicationService.Receive(unknown, sizeof(unknown)), sizeof(unknown));

		EXPECT_CALL(communicationService, Send(testing::_, 3))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x7f, 0x22, 0x13 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});
		const uint8_t malformed[] = { 0x22, 0xf1 };
		EXPECT_EQ(communicationService.Receive(malformed, sizeof(malformed)), sizeof(malformed));
	}

	TEST(CommunicationHandler_UDSDIDTests, RequestDIDSendsService22Request)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_UDSDIDRequester service(&communicationService);

		EXPECT_CALL(communicationService, Send(testing::_, 3))
			.WillOnce([](const void *data, size_t) {
				const uint8_t expected[] = { 0x22, 0xf1, 0x90 };
				EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
			});
		EXPECT_TRUE(service.RequestDID(0xf190));
	}

	TEST(CommunicationHandler_UDSDIDTests, MatchingService22ResponseCallsRegisteredCallback)
	{
		EmbeddedIOServices::MockCommunicationService communicationService;
		CommunicationHandler_UDSDIDRequester service(&communicationService);
		unsigned int calls = 0;
		service.RegisterReceivedDID(0xf190, [&](const void *data, size_t length) {
			++calls;
			const uint8_t expected[] = { 0x56, 0x78 };
			ASSERT_EQ(length, sizeof(expected));
			EXPECT_EQ(std::memcmp(data, expected, sizeof(expected)), 0);
		});

		const uint8_t response[] = { 0x62, 0xf1, 0x90, 0x56, 0x78 };
		EXPECT_EQ(communicationService.Receive(response, sizeof(response)), sizeof(response));
		EXPECT_EQ(calls, 1u);
	}

}
